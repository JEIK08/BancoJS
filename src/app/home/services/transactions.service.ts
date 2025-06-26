import { Injectable } from '@angular/core';
import { EMPTY, Observable, concatMap, expand, from, last, map, takeLast } from 'rxjs';

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
    const originPocket: Pocket | undefined = data.origin.pocket;
    const destination: Account | undefined = data.destination?.account;
    const destinationPocket: Pocket | undefined = data.destination?.pocket;

    const transaction: Transaction = {
      description: data.description || originPocket?.name || destinationPocket?.name,
      type,
      value,
      date: this.firestoreService.getDate(data.date),
      account: {
        name: origin.name,
      }
    } as Transaction;

    const originBody: Partial<Account> = {};

    if (origin.isActive) {
      const pocket = originPocket as Pocket;
      transaction.account.pocket = pocket.name;

      if (type === TransactionType.IN) {
        pocket.value += value;
        origin.value += value;
      } else {
        pocket.value -= value;
        origin.value -= value;

        if (origin !== destination) {
          origin.monthExpenses = {
            lastUpdate: this.firestoreService.getDate(new Date()),
            value: Math.round((origin.monthExpenses.value + value) * 100) / 100
          };
        }
      }

      pocket.value = Math.round(pocket.value * 100) / 100;
      originBody.pockets = origin.pockets;
      originBody.monthExpenses = origin.monthExpenses;
    } else {
      if (type === TransactionType.IN) origin.value -= value;
      else origin.value += value;
    }

    origin.value = Math.round(origin.value * 100) / 100;
    originBody.value = origin.value;

    const requests$: Observable<any>[] = [
      this.firestoreService.updateDocument<Account>(Collection.Account, origin.id, originBody)
    ];

    if (destination) {
      const destinationBody: Partial<Account> = {};
      transaction.destination = { name: destination.name };

      if (destination.isActive) {
        const pocket = destinationPocket as Pocket;
        transaction.destination.pocket = pocket.name;

        if (type === TransactionType.OUT) {
          pocket.value -= value;
          destination.pockets[0].value += value;
        } else {
          pocket.value += value;
          destination.value += value;
        }

        pocket.value = Math.round(pocket.value * 100) / 100;
        destinationBody.pockets = destination.pockets;
      } else {
        destination.value -= value;
      }

      destination.value = Math.round(destination.value * 100) / 100;
      destinationBody.value = destination.value;

      requests$.push(
        this.firestoreService.updateDocument<Account>(Collection.Account, destination.id, destinationBody)
      );
    }

    requests$.push(this.firestoreService.addDocument(Collection.Transaction, transaction));

    return from(requests$).pipe(concatMap(req$ => req$), takeLast(1));
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