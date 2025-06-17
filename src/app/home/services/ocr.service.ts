import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { SendIntent } from "send-intent";
import { Filesystem } from "@capacitor/filesystem";
import { createWorker, OEM, Rectangle, Worker } from 'tesseract.js';

import { TransactionType } from 'src/app/interfaces/transaction';

@Injectable()
export class OcrService {

  private worker?: Worker;
  private base64?: string;

  constructor() { }

  async getIntentData() {
    try {
      const { url, type } = await SendIntent.checkSendIntentReceived();
      const { data } = await Filesystem.readFile({ path: decodeURIComponent(url!) });
      return `data:${ type };base64,${ data }`;
    } catch (e) {
      console.log(e);
      return null;
    };
  }

  async getImageData(base64: string) {
    this.base64 = base64;
    this.worker = await createWorker('spa', OEM.LSTM_ONLY);
    try {
      return {
        type: TransactionType.OUT,
        account: environment.accounts.pasive,
        destination: environment.accounts.active,
        ...await this.processImage(
          { left: 65, top: 252, width: 928, height: 73 },
          'Comprobante de transacción',
          { left: 64, top: 359, width: 927, height: 46 },
          /(\d{1,2}) de (\w+) de (\d{4}), (\d{2}):(\d{2})/,
          ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          { left: 661, top: 524, width: 355, height: 47 }
        )
      };
    } catch (e) { this.processError('Credit transaction error', e) };

    try {
      return {
        type: TransactionType.OUT,
        account: environment.accounts.active,
        ...await this.processImage(
          { left: 65, top: 193, width: 698, height: 77 },
          '¡Has enviado dinero!',
          { left: 62, top: 299, width: 469, height: 60 },
          /(\d{1,2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/,
          ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
          { left: 65, top: 1263, width: 263, height: 37 },
        )
      };
    } catch (e) { this.processError('Interbank transaction error', e) };

    throw 404;
  }

  private async processImage(
    confirmatiomRectangle: Rectangle,
    confirmationText: string,
    dateRectangle: Rectangle,
    dateRegExp: RegExp,
    monthsNames: string[],
    valueRectangle: Rectangle
  ) {
    const checkText = await this.worker!.recognize(this.base64!, { rectangle: confirmatiomRectangle });
    if (checkText.data.text.trim() !== confirmationText) throw '';

    const dateText = await this.worker!.recognize(this.base64!, { rectangle: dateRectangle });
    const match = dateText.data.text.match(dateRegExp);
    if (!match) throw 'Wrong Date Format';

    const [, day, montName, year, hours, minutes] = match;
    const month = String(monthsNames.indexOf(montName) + 1);
    const date = `${ year }-${ month.padStart(2, '0') }-${ day.padStart(2, '0') }T${ hours.padStart(2, '0') }:${ minutes.padStart(2, '0') }`;

    debugger;
    const value = await this.worker!.recognize(this.base64!, { rectangle: valueRectangle });
    const valueText = value.data.text.trim();
    if (!(/^\$\d{1,3}(\.\d{3})*(,\d{2})?$/.test(valueText))) throw 'Wrong value';
    const values = valueText.substring(1).split(',');
    values[0] = values[0].replaceAll('.', '');

    return { value: Number(values.join('.')), date: new Date(date) };
  }

  processError(receiptText: string, error: any) {
    console.log(receiptText, '-', error || 'Not this type');
    if (error) throw error;
  }

  terminate() {
    this.worker?.terminate();
  }

}
