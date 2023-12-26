import { Injectable } from '@angular/core';

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
  QuerySnapshot
} from '@angular/fire/firestore';

export enum Collection {
  Account = 'Account',
  Transaction = 'Transaction'
}

@Injectable()
export class FirebaseService {

  constructor(private firestore: Firestore) {
    console.log('Create FirebaseService Instance');
  }

  getCollectionRef(collectionName: Collection) {
    return collection(this.firestore, collectionName);
  }

  getDocumentRef(collectionName: Collection, id: string) {
    return doc(this.firestore, collectionName, id);
  }

  listenCollection(collectionName: Collection, onChange: (data?: QuerySnapshot<any>) => void) {
    onSnapshot(this.getCollectionRef(collectionName), snapshot => onChange(snapshot));
  }

  getDocuments<T>(collectionName: Collection, data: {
    queryConstrains?: QueryConstraint[],
    mapFunction?: (doc: T) => void
  } = {}): Promise<T[]> {
    const { queryConstrains, mapFunction } = data;
    return getDocs(query(this.getCollectionRef(collectionName), ...queryConstrains ?? [])).then(({ docs }) => new Promise(resolve => {
      resolve(
        docs.map(docRef => {
          const doc: any = docRef.data();
          doc.id = docRef.id;
          mapFunction?.(doc);
          return doc;
        })
      );
    }));
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
