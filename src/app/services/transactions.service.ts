import { Injectable } from '@angular/core';

import { FirebaseService } from './firebase.service';

import { Account } from '../interfaces/account';
import { TransactionType, Transaction } from '../interfaces/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(private firebaseService: FirebaseService) { }

  async createTransaction(transactionData: any) {
    const transaction: Transaction = {
      description: transactionData.description,
      type: transactionData.type,
      value: transactionData.value,
      date: transactionData.date,
      account: transactionData.account.name
    };
    const type: Transaction['type'] = transactionData.type;
    const account: Account = transactionData.account;
    const activeAccount: Account = transactionData.activeAccount;
    const installments: Transaction['installments'] = transactionData.installments;
    const destination:  Account = transactionData.destination 

    if (type == TransactionType.OUT && !account.isActive) {
      if (activeAccount) {
        transaction.activeAccount = activeAccount.name;
        // Aumentar deuda de la cuenta activa
      }
      if (installments) {
        transaction.installments = installments;
        // Pagos por cuotas
      }
    }

    if (type == TransactionType.TRANSFER) {
      transaction.destination = destination.name;
      if (transactionData.showAffectDebts && transactionData.affectDebts) {
        transaction.affectDebts = true;
      }
    }

    console.log(transaction);
  }

}
