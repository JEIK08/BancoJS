import { Injectable } from '@angular/core';
import { Observable, from, map, finalize, Subject } from 'rxjs';

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
} from '@angular/fire/firestore';

import { AuthService } from 'src/app/services/auth.service';

export enum Collection {
  Account = 'Account',
  Transaction = 'Transaction'
}

@Injectable()
export class FirebaseService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  private getCollectionPath(collectionName: Collection) {
    return `/Databases/${ this.authService.getDatabaseName }/${ collectionName }`;
  }

  private getCollectionRef(collectionName: Collection) {
    return collection(this.firestore, this.getCollectionPath(collectionName));
  }

  private getDocumentRef(collectionName: Collection, id: string) {
    return doc(this.firestore, this.getCollectionPath(collectionName), id);
  }

  listenCollection(collectionName: Collection) {
    // return onSnapshot(this.getCollectionRef(collectionName), snapshot => onChange(snapshot));
    const subject = new Subject();
    const observable = subject.asObservable();
    const unsubscriber = onSnapshot(
      this.getCollectionRef(collectionName),
      data => {
        console.log('Next snapshot');
        subject.next(data);
      },
      subject.error,
    );
    return observable.pipe(
      finalize(() => {
        console.log('Finalize observable');
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

  getDocument<T>(collectionName: Collection, id: string): Promise<T> {
    return getDoc(this.getDocumentRef(collectionName, id)).then(docRef => new Promise(resolve => {
      const doc: any = docRef.data();
      doc.id = docRef.id;
      resolve(doc);
    }));
  }

  addDocument(collectionName: Collection, data: any) {
    return addDoc(this.getCollectionRef(collectionName), data);
  }

  updateDocument<T>(collectionName: Collection, id: string, data: Partial<T>) {
    return updateDoc(this.getDocumentRef(collectionName, id) as any, data as any);
  }

  mapDate(date: any) {
    return new Date(date.seconds * 1000);
  }

  getDate(date: Date) {
    return Timestamp.fromDate(date)
  }

}
