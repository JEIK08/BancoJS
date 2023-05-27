import { Injectable } from '@angular/core';

import { QueryConstraint, limit, orderBy, startAfter } from '@angular/fire/firestore';

import { Collection, FirebaseService } from './firebase.service';

import { Account, Pocket } from '../interfaces/account';
import { TransactionType, Transaction } from '../interfaces/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(private firebaseService: FirebaseService) { }

  async createTransaction(data: any) {
    const type: TransactionType = data.type;
    const value: number = data.value;
    const origin: Account = data.origin.account;
    const originPocket: Pocket = data.origin.pocket;
    const destination: Account = data.destination.account;
    const destinationPocket: Pocket = data.destination.pocket;

    const transaction: Transaction = {
      description: data.description,
      type,
      value,
      date: this.firebaseService.getDate(data.date) as any,
      account: {
        name: origin.name,
        isActive: origin.isActive
      }
    } as Transaction;
    if (destination) {
      transaction.destination = { name: destination.name, isActive: destination.isActive };
      if (destination.isActive) transaction.destination.pocket = destinationPocket.name;
    }

    const promises: Promise<any>[] = [];

    if (origin.isActive) {
      let accountValue: number = origin.value;
      let accountDebt: number = origin.debt;
      switch (type) {
        case TransactionType.IN:
          transaction.account.pocket = originPocket.name;
          originPocket.value += value;
          accountValue = accountValue + value;
          break;

        case TransactionType.OUT:
          transaction.account.pocket = originPocket.name;
          originPocket.value -= value;
          accountValue = accountValue - value;
          break;

        case TransactionType.TRANSFER:
          if (originPocket as any === 0) {
            transaction.account.pocket = 'Deuda';
            accountDebt = accountDebt - value;
          } else {
            transaction.account.pocket = originPocket.name;
            originPocket.value -= value;
          }
          accountValue = accountValue - value;
          break;

      }
      promises.push(
        this.firebaseService.updateDocument<Account>(Collection.Account, origin.id, {
          value: accountValue,
          pockets: origin.pockets,
          debt: accountDebt
        })
      );
      if (type == TransactionType.TRANSFER) {
        if (destination.isActive) {
          destinationPocket.value += value;
          promises.push(
            this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
              value: destination.value + value,
              pockets: destination.pockets
            })
          );
        } else {
          promises.push(
            this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
              value: destination.value - value
            })
          );
        }
      }
    } else {
      promises.push(
        this.firebaseService.updateDocument<Account>(Collection.Account, origin.id, {
          value: origin.value + (type == TransactionType.IN ? -value : value)
        })
      );
      if (type == TransactionType.OUT) {
        destinationPocket.value -= value;
        promises.push(
          this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
            debt: destination.debt + value,
            pockets: destination.pockets
          })
        );
      }
      if (type == TransactionType.TRANSFER) {
        if (destination.isActive) {
          destinationPocket.value += value;
          promises.push(
            this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
              value: destination.value + value,
              pockets: destination.pockets
            })
          );
        } else {
          promises.push(
            this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
              value: destination.value - value
            })
          );
        }
      }
    }

    promises.push(this.firebaseService.addDocument(Collection.Transaction, transaction));
    return Promise.all(promises);
  }

  getTransactions(page: number, transactions?: Transaction[]) {
    const pageSize = 15;
    const queryConstrains: QueryConstraint[] = [orderBy('date', 'desc')];
    if (page > 1) queryConstrains.push(startAfter(transactions![transactions!?.length - 1].date));
    queryConstrains.push(limit(pageSize));
    return this.firebaseService.getDocuments<Transaction>(Collection.Transaction, {
      queryConstrains,
      mapFunction: transaction => transaction.date = this.firebaseService.mapDate(transaction.date)
    });
  }

}
