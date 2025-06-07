import { Injectable } from '@angular/core';
import { Observable, from, map, finalize, Subject, switchMap } from 'rxjs';

import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  Timestamp,
  QueryConstraint,
  deleteField
} from '@angular/fire/firestore';

export enum Collection {
  Account = 'Account',
  Transaction = 'Transaction'
}

@Injectable()
export class FirestoreService {

  private database: string = '';

  constructor(private firestore: Firestore) { }

  private getCollectionPath(collectionName: Collection) {
    return `/Database/${ this.database }/${ collectionName }`;
  }

  private getCollectionRef(collectionName: Collection) {
    return collection(this.firestore, this.getCollectionPath(collectionName));
  }

  private getDocumentRef(collectionName: Collection, id: string) {
    return doc(this.firestore, this.getCollectionPath(collectionName), id);
  }

  setUserDatabase(uid: string) {
    return from(
      getDoc(
        doc(this.firestore, `/User`, uid)
      )
    ).pipe(
      map(docRef => {
        this.database = docRef.data()?.['database'];
        return;
      })
    );
  }

  listenCollection(collectionName: Collection) {
    const subject = new Subject<void>();
    const observable = subject.asObservable();
    const unsubscriber = onSnapshot(
      this.getCollectionRef(collectionName),
      () => subject.next(),
      error => subject.error(error),
    );
    return observable.pipe(
      finalize(() => {
        subject.complete();
        unsubscriber();
      })
    );
  }

  getDocuments<T>(collectionName: Collection, data: {
    queryConstrains?: QueryConstraint[],
    mapFunction?: (doc: T) => void
  } = {}): Observable<T[]> {
    const { queryConstrains, mapFunction } = data;
    return from(
      getDocs(
        query(this.getCollectionRef(collectionName), ...queryConstrains ?? [])
      )
    ).pipe(
      map(({ docs }) => {
        return docs.map(docRef => {
          const doc: any = docRef.data();
          doc.id = docRef.id;
          mapFunction?.(doc);
          return doc;
        })
      })
    );
  }

  getDocument<T>(collectionName: Collection, id: string): Observable<T> {
    return from(getDoc(this.getDocumentRef(collectionName, id))).pipe(
      map(docRef => {
        const doc: any = docRef.data();
        doc.id = docRef.id;
        return doc;
      })
    );
  }

  addDocument(collectionName: Collection, data: any) {
    return from(addDoc(this.getCollectionRef(collectionName), data)).pipe(map(() => undefined));
  }

  updateDocument<T>(collectionName: Collection, id: string, data: Partial<T>) {
    return from(updateDoc(this.getDocumentRef(collectionName, id) as any, data as any));
  }
  
  setDocument<T>(collectionName: Collection, id: string, data: any) {
    // data.debt = deleteField();
    // return from(updateDoc(this.getDocumentRef(collectionName, id) as any, data as any));
  }

  mapDate(date: any) {
    return new Date(date.seconds * 1000);
  }

  getDate(date: Date) {
    return Timestamp.fromDate(date);
  }

}
