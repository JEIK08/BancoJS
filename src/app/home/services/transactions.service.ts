import { Injectable } from '@angular/core';

import { QueryConstraint, limit, orderBy, startAfter } from '@angular/fire/firestore';

import { Collection, FirebaseService } from './firebase.service';

import { Account, Pocket } from '../../interfaces/account';
import { TransactionType, Transaction } from '../../interfaces/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(private firebaseService: FirebaseService) { }

  listenTransactions(action: () => void) {
    this.firebaseService.listenCollection(Collection.Transaction, action);
  }

  createTransaction(data: any) {
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
            accountDebt -= value;
          } else {
            transaction.account.pocket = originPocket.name;
            originPocket.value -= value;
          }
          accountValue -= value;
          break;
      }
      if (originPocket as any != 0) originPocket.value = Math.round(originPocket.value * 100) / 100;
      promises.push(
        this.firebaseService.updateDocument<Account>(Collection.Account, origin.id, {
          value: Math.round(accountValue * 100) / 100,
          pockets: origin.pockets,
          debt: Math.round(accountDebt * 100) / 100
        })
      );
      if (type == TransactionType.TRANSFER) {
        if (destination.isActive) {
          destinationPocket.value = Math.round((destinationPocket.value + value) * 100) / 100;
          promises.push(
            this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
              value: Math.round((destination.value + value) * 100) / 100,
              pockets: destination.pockets
            })
          );
        } else {
          promises.push(
            this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
              value: Math.round((destination.value - value) * 100) / 100
            })
          );
        }
      }
    } else {
      promises.push(
        this.firebaseService.updateDocument<Account>(Collection.Account, origin.id, {
          value: Math.round((origin.value + (type == TransactionType.IN ? -value : value)) * 100) / 100
        })
      );
      if (type == TransactionType.OUT) {
        destinationPocket.value = Math.round((destinationPocket.value - value) * 100) / 100;
        promises.push(
          this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
            debt: Math.round((destination.debt + value) * 100) / 100,
            pockets: destination.pockets
          })
        );
      }
      if (type == TransactionType.TRANSFER) {
        if (destination.isActive) {
          destinationPocket.value = Math.round((destinationPocket.value + value) * 100) / 100;
          promises.push(
            this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
              value: Math.round((destination.value + value) * 100) / 100,
              pockets: destination.pockets
            })
          );
        } else {
          promises.push(
            this.firebaseService.updateDocument<Account>(Collection.Account, destination.id, {
              value: Math.round((destination.value - value) * 100) / 100
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
