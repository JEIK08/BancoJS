import { Injectable } from '@angular/core';

import { SendIntent } from "send-intent";
import { Filesystem } from "@capacitor/filesystem";
import { createWorker, OEM, Worker } from 'tesseract.js';
import { TransactionType } from 'src/app/interfaces/transaction';

@Injectable()
export class OcrService {

  private worker?: Worker;
  private base64?: string;

  constructor() { }
  
  async processReceipt() {
    try {
      const { url, type } = await SendIntent.checkSendIntentReceived();
      const { data } = await Filesystem.readFile({ path: decodeURIComponent(url!) });
      return await this.readImage(`data:${ type };base64,${ data }`);
    } catch (e) {
      console.log(e);
      return null;
    };
  }

  async readImage(base64: string) {
    this.base64 = base64;
    this.worker = await createWorker('spa', OEM.LSTM_ONLY);
    try { return await this.getCreditTransaction() } catch (e) { console.log(e); };
    try { return await this.getInterbankTransaction() } catch (e) { console.log(e); };
    throw 'Receipt not recognized';
  }

  private async getCreditTransaction() {
    const checkText = await this.worker!.recognize(this.base64!, { rectangle: { left: 65, top: 252, width: 928, height: 73 } });
    if (checkText.data.text.trim() !== 'Comprobante de transacción') throw 'No Credit Transaction';

    const dateText = await this.worker!.recognize(this.base64!, { rectangle: { left: 64, top: 359, width: 927, height: 46 } });
    const match = dateText.data.text.match(/(\d{1,2}) de (\w+) de (\d{4}), (\d{2}):(\d{2})/);
    if (!match) throw 'Credit transaction - Wrong Date Format';

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [, day, montName, year, hours, minutes] = match;
    const month = String(months.indexOf(montName) + 1);
    const date = `${ year }-${ month.padStart(2, '0') }-${ day.padStart(2, '0') }T${ hours.padStart(2, '0') }:${ minutes.padStart(2, '0') }`;

    const valueText = await this.worker!.recognize(this.base64!, { rectangle: { left: 661, top: 524, width: 355, height: 47 } });
    return {
      type: TransactionType.OUT,
      value: Number(valueText.data.text.substring(1).replaceAll('.', '').replace(',', '.')),
      date,
      account: 'Sm9lMMjMFcOmEQNgqkay',
      destination: 'an9FcOjNzC6dz7Lj7CmV'
    };
  }

  private async getInterbankTransaction() {
    const checkText = await this.worker!.recognize(this.base64!, { rectangle: { left: 65, top: 193, width: 698, height: 77 } });
    if (checkText.data.text.trim() !== '¡Has enviado dinero!') throw 'No Interbank Transaction';

    const dateText = await this.worker!.recognize(this.base64!, { rectangle: { left: 62, top: 299, width: 469, height: 60 } });
    const match = dateText.data.text.match(/(\d{1,2}) (\w{3}) (\d{4}), (\d{2}):(\d{2})/);
    if (!match) throw 'Interbank transaction - Wrong Date Format';

    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const [, day, montName, year, hours, minutes] = match;
    const month = String(months.indexOf(montName) + 1);
    const date = `${ year }-${ month.padStart(2, '0') }-${ day.padStart(2, '0') }T${ hours.padStart(2, '0') }:${ minutes.padStart(2, '0') }`;

    const valueText = await this.worker!.recognize(this.base64!, { rectangle: { left: 86, top: 1264, width: 282, height: 35 } });
    return {
      type: TransactionType.OUT,
      value: Number(valueText.data.text.replaceAll('.', '')),
      date,
      account: 'an9FcOjNzC6dz7Lj7CmV',
    };
  }

}
