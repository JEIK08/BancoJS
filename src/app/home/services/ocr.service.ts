import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { SendIntent } from "send-intent";
import { Filesystem } from "@capacitor/filesystem";
import { createWorker, OEM, RecognizeResult, Rectangle, Worker } from 'tesseract.js';

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
        account: environment.accounts.active,
        ...await this.processImage(
          { left: 64, top: 252, width: 544, height: 145 },
          'Comprobante de transferencia',
          { left: 65, top: 444, width: 600, height: 42 },
          /(\d{2}) (\w{3}) (\d{4}) - (\d{2}):(\d{2}):(\d{2})/,
          ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
          { left: 628, top: 610, width: 388, height: 45 }
        )
      };
    } catch (e) { this.processError('Debit out', e) };

    try {
      return {
        type: TransactionType.OUT,
        account: environment.accounts.pasive,
        destination: environment.accounts.active,
        ...await this.processImage(
          { left: 65, top: 2174, width: 118, height: 30 },
          'Cuotas',
          { left: 67, top: 821, width: 900, height: 43 },
          /(\d{1,2}) de (\w+) de (\d{4}), (\d{2}):(\d{2})/,
          ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          { left: 66, top: 689, width: 607, height: 73 }
        )
      };
    } catch (e) { this.processError('Credit out', e) };

    try {
      return {
        type: TransactionType.OUT,
        account: environment.accounts.active,
        ...await this.processImage(
          { left: 65, top: 193, width: 698, height: 77 },
          '¡Has enviado dinero!',
          { left: 62, top: 299, width: 469, height: 52 },
          /(\d{2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/,
          ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
          { left: 65, top: 1263, width: 264, height: 38 },
        )
      };
    } catch (e) { this.processError('Interbank out', e) };

    try {
      return {
        type: TransactionType.OUT,
        account: environment.accounts.active,
        ...await this.processImage(
          { left: 64, top: 252, width: 940, height: 159 },
          'Comprobante de compra con tarjeta de débito',
          { left: 65, top: 444, width: 500, height: 42 },
          /(\d{2}) (\w{3}) (\d{4}) (\d{2}):(\d{2})/,
          ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
          { left: 614, top: 610, width: 402, height: 44 },
        )
      };
    } catch (e) { this.processError('Debit out with card', e) };

    try {
      return {
        type: TransactionType.OUT,
        account: environment.accounts.active,
        ...await this.processImage(
          { left: 67, top: 259, width: 682, height: 72 },
          '¡Listo! Hiciste tu pago',
          { left: 66, top: 362, width: 400, height: 39 },
          /(\d{2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/,
          ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
          { left: 65, top: 964, width: 343, height: 38 },
        )
      };
    } catch (e) { this.processError('PSE', e) };

    try {
      return {
        type: TransactionType.IN,
        account: environment.accounts.active,
        ...await this.processImage(
          { left: 75, top: 1030, width: 730, height: 44 },
          'Aceptada Transferencia interbancaria',
          { left: 67, top: 907, width: 400, height: 45 },
          /(\d{2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/,
          ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
          { left: 65, top: 775, width: 651, height: 75 },
        )
      };
    } catch (e) { this.processError('Interbank in', e) };

    try {
      return {
        type: TransactionType.TRANSFER,
        account: environment.accounts.active,
        destination: environment.accounts.pasive,
        ...await this.processImage(
          { left: 65, top: 278, width: 804, height: 75 },
          'Comprobante de tu pago',
          { left: 65, top: 382, width: 600, height: 49 },
          /(\d{2}) (\w+) (\d{4}) (\d{2}):(\d{2})/,
          ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
          { left: 543, top: 652, width: 450, height: 48 },
        )
      };
    } catch (e) { this.processError('Pay credit card', e) };

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
    let result: RecognizeResult;
    try {
      result = await this.worker!.recognize(this.base64!, { rectangle: confirmatiomRectangle });
    } catch (error) { throw '' }
    if (result.data.text.replaceAll('\n', ' ').trim() !== confirmationText) throw '';

    result = await this.worker!.recognize(this.base64!, { rectangle: dateRectangle });
    const match = result.data.text.match(dateRegExp);
    if (!match) throw 'Wrong Date Format';

    const [, day, montName, year, hours, minutes] = match;
    const month = String(monthsNames.indexOf(montName) + 1);
    const date = `${ year }-${ month.padStart(2, '0') }-${ day.padStart(2, '0') }T${ hours.padStart(2, '0') }:${ minutes.padStart(2, '0') }`;

    result = await this.worker!.recognize(this.base64!, { rectangle: valueRectangle });
    const valueText = result.data.text.trim();
    if (!(/^\$ ?\d{1,3}(\.\d{3})*(,\d{2})?$/.test(valueText))) throw 'Wrong value';
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
    SendIntent.finish();
  }

}
