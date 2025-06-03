import { Injectable } from '@angular/core';
import { EMPTY, Observable, expand, forkJoin, last, map } from 'rxjs';

import { QueryConstraint, limit, orderBy, startAfter } from '@angular/fire/firestore';

import { Collection, FirestoreService } from '../../services/firestore.service';

import { Account, Pocket } from '../../interfaces/account';
import { TransactionType, Transaction } from '../../interfaces/transaction';

@Injectable()
export class TransactionsService {

  private pageSize = 15;
  private lastPageDate?: Transaction['date'];

  constructor(private firestoreService: FirestoreService) { }

  listenTransactions() {
    return this.firestoreService.listenCollection(Collection.Transaction);
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
      date: this.firestoreService.getDate(data.date) as any,
      account: {
        name: origin.name,
        isActive: origin.isActive
      }
    } as Transaction;
    if (destination) {
      transaction.destination = { name: destination.name, isActive: destination.isActive };
      if (destination.isActive) transaction.destination.pocket = destinationPocket.name;
    }

    const observables: Observable<any>[] = [];

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
      observables.push(
        this.firestoreService.updateDocument<Account>(Collection.Account, origin.id, {
          value: Math.round(accountValue * 100) / 100,
          pockets: origin.pockets,
          debt: Math.round(accountDebt * 100) / 100
        })
      );
      if (type == TransactionType.TRANSFER) {
        if (destination.isActive) {
          destinationPocket.value = Math.round((destinationPocket.value + value) * 100) / 100;
          observables.push(
            this.firestoreService.updateDocument<Account>(Collection.Account, destination.id, {
              value: Math.round((destination.value + value) * 100) / 100,
              pockets: destination.pockets
            })
          );
        } else {
          observables.push(
            this.firestoreService.updateDocument<Account>(Collection.Account, destination.id, {
              value: Math.round((destination.value - value) * 100) / 100
            })
          );
        }
      }
    } else {
      observables.push(
        this.firestoreService.updateDocument<Account>(Collection.Account, origin.id, {
          value: Math.round((origin.value + (type == TransactionType.IN ? -value : value)) * 100) / 100
        })
      );
      if (type == TransactionType.OUT) {
        destinationPocket.value = Math.round((destinationPocket.value - value) * 100) / 100;
        observables.push(
          this.firestoreService.updateDocument<Account>(Collection.Account, destination.id, {
            debt: Math.round((destination.debt + value) * 100) / 100,
            pockets: destination.pockets
          })
        );
      }
      if (type == TransactionType.TRANSFER) {
        if (destination.isActive) {
          destinationPocket.value = Math.round((destinationPocket.value + value) * 100) / 100;
          observables.push(
            this.firestoreService.updateDocument<Account>(Collection.Account, destination.id, {
              value: Math.round((destination.value + value) * 100) / 100,
              pockets: destination.pockets
            })
          );
        } else {
          observables.push(
            this.firestoreService.updateDocument<Account>(Collection.Account, destination.id, {
              value: Math.round((destination.value - value) * 100) / 100
            })
          );
        }
      }
    }

    observables.push(this.firestoreService.addDocument(Collection.Transaction, transaction));
    return forkJoin(observables);
  }

  getTransactions(filterText = '', lastDate?: Transaction['dateText']) {
    const queryConstrains: QueryConstraint[] = [orderBy('date', 'desc'), limit(this.pageSize)];
    let emptyPages = 0;
    const filteredPage: Transaction[] = [];

    filterText = filterText?.toLowerCase();
    if (new RegExp('\\d{2}/\\d{2}/\\d{2}').test(filterText)) {
      if (!lastDate) {
        const [day, month, year] = filterText.split('/')
        lastDate = 'xxx';
        this.lastPageDate = new Date(Number(year), Number(month) - 1, Number(day) + 1);
      }
      filterText = '';
    }

    return this.firestoreService.getDocuments<Transaction>(
      Collection.Transaction,
      { queryConstrains: lastDate ? [...queryConstrains, startAfter(this.lastPageDate)] : queryConstrains }
    ).pipe(
      expand(transactions => {
        this.lastPageDate = transactions.at(-1)?.date;
        return filteredPage.length == this.pageSize || emptyPages == 7 || transactions.length < this.pageSize
          ? EMPTY
          : this.firestoreService.getDocuments<Transaction>(
            Collection.Transaction,
            { queryConstrains: [...queryConstrains, startAfter(this.lastPageDate)] }
          );
      }),
      map(transactions => {
        let someFiltered = false;

        transactions.some(transaction => {
          transaction.date = this.firestoreService.mapDate(transaction.date);
          transaction.dateText = transaction.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

          const isFiltered = !filterText ||
            transaction.description.toLowerCase().includes(filterText) ||
            transaction.account.name.toLowerCase().includes(filterText) ||
            transaction.account.pocket?.toLowerCase().includes(filterText) ||
            transaction.destination?.name.toLowerCase().includes(filterText) ||
            transaction.destination?.pocket?.toLowerCase().includes(filterText) ||
            String(transaction.value).includes(filterText) ||
            transaction.dateText?.includes(filterText);

          if (isFiltered) {
            someFiltered = true;
            filteredPage.push(transaction);

            if (lastDate != transaction.dateText) {
              transaction.isLastOfDay = true;
              lastDate = transaction.dateText;
            }
          }
          
          return filteredPage.length == this.pageSize;
        });

        emptyPages = someFiltered ? 0 : emptyPages + 1;
        return filteredPage;
      }),
      last()
    );
  }

}