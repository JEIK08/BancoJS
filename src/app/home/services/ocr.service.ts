import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { SendIntent } from "send-intent";
import { Filesystem } from "@capacitor/filesystem";
import { createWorker, OEM, Worker, PSM } from 'tesseract.js';

import { TransactionType } from 'src/app/interfaces/transaction';
import { MONTHS, VALUE_REGEX } from './oct.utils';

@Injectable()
export class OcrService {

  private worker?: Worker;
  private text!: string;

  constructor() { }

  async getIntentData() {
    try {
      const { url, type } = await SendIntent.checkSendIntentReceived();
      const { data } = await Filesystem.readFile({ path: decodeURIComponent(url!) });
      return await this.convertToBlackAndWhite(`data:${ type };base64,${ data }`);
    } catch (e) {
      console.log(e);
      return null;
    };
  }

  convertToBlackAndWhite(base64: string) {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 2400;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const threshold = 170;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const avg = 0.3 * r + 0.59 * g + 0.11 * b;
          const bw = avg < threshold ? 0 : 255;
          data[i] = data[i + 1] = data[i + 2] = bw;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => reject(e);
    });
  }

  async getImageData(base64: string) {
    this.worker = await createWorker('spa', OEM.LSTM_ONLY);
    this.worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_COLUMN });

    try {
      this.text = (await this.worker!.recognize(base64!)).data.text.replaceAll('\n', ' ').replaceAll('  ', ' ');
    } catch (error) { throw '' }

    return await this.processData(
      // Gasto débito / Envío por llave
      'Comprobante de transferencia',
      /(\d{2}) (\w{3}) (\d{4}) - (\d{2}):(\d{2}):(\d{2})/,
      MONTHS.upper3,
      { type: TransactionType.OUT, account: environment.accounts.active }
    ) ?? await this.processData(
      // Gasto crédito
      'Cuotas',
      /(\d{1,2}) de (\w+) de (\d{4}), (\d{2}):(\d{2})/,
      MONTHS.capFull,
      { type: TransactionType.OUT, account: environment.accounts.pasive, destination: environment.accounts.active }
    ) ?? await this.processData(
      // Envío interbancario
      '¡Has enviado dinero!',
      /(\d{2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/,
      MONTHS.lower3,
      { type: TransactionType.OUT, account: environment.accounts.active }
    ) ?? await this.processData(
      // Pagos PSE
      '¡Listo! Hiciste tu pago',
      /(\d{2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/,
      MONTHS.lower3,
      { type: TransactionType.OUT, account: environment.accounts.active }
    ) ?? await this.processData(
      // Gasto débito con tarjeta
      'Comprobante de compra con tarjeta de débito',
      /(\d{2}) (\w{3}) (\d{4}) (\d{2}):(\d{2})/,
      MONTHS.upper3,
      { type: TransactionType.OUT, account: environment.accounts.active }
    ) ?? await this.processData(
      // Ingreso inmediato (Llave)
      'Aceptada Transferencia inmediata',
      /(\d{2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/,
      MONTHS.lower3,
      { type: TransactionType.IN, account: environment.accounts.active }
    ) ?? await this.processData(
      // Ingresso interbancario
      'Aceptada Transferencia interbancaria',
      /(\d{2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/,
      MONTHS.lower3,
      { type: TransactionType.IN, account: environment.accounts.active }
    ) ?? await this.processData(
      // Pago de tarjeta de crédito
      'Comprobante de tu pago',
      /(\d{2}) (\w+) (\d{4}) (\d{2}):(\d{2})/,
      MONTHS.lowerFull,
      { type: TransactionType.TRANSFER, account: environment.accounts.active, destination: environment.accounts.pasive }
    ) ?? await this.processData(
      // Retiro de efectivo
      'Retiro de efectivo',
      /(\d{2}) (\w{3}) (\d{4}) (\d{2}):(\d{2})/,
      MONTHS.upper3,
      { type: TransactionType.OUT, account: environment.accounts.active }
    );
  }

  private async processData(
    confirmationText: string,
    dateRegExp: RegExp,
    monthsNames: string[],
    additionalParams: any
  ) {
    if (!this.text.includes(confirmationText)) return undefined;

    const [, day, montName, year, hours, minutes] = this.text.match(dateRegExp)!;
    const month = String(monthsNames.indexOf(montName) + 1);
    const date = `${ year }-${ month.padStart(2, '0') }-${ day.padStart(2, '0') }T${ hours.padStart(2, '0') }:${ minutes.padStart(2, '0') }`;

    const values = this.text.match(VALUE_REGEX)![1].split(',');
    values[0] = values[0].replaceAll('.', '');

    return { value: Number(values.join('.')), date: new Date(date), ...additionalParams };
  }

  terminate() {
    this.worker?.terminate();
    SendIntent.finish();
  }

}
