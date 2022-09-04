import {
  addDoc,
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  setDoc,
  Transaction,
  updateDoc
} from "firebase/firestore";
import { pickBy } from "lodash";

export interface DocumentAggregateProps {
  data?: any;
  ref?: DocumentReference;
}

export class DocumentAggregate implements DocumentAggregateProps {
  data?: any;
  ref?: DocumentReference;

  constructor(_ref?: DocumentReference) {
    this.ref = _ref;
  }

  private generateOrmEntity() {
    const entityData: any = pickBy(
      Object.assign({}, this),
      (value, key) => key !== "data" && key !== "ref" && value !== undefined
    );
    Object.entries(entityData).map(([key, value]: any) => {
      if (value?.toJSON) {
        entityData[key] = value.toJSON();
      }
    });

    return entityData;
  }

  get id() {
    return this.ref!.id.toString();
  }

  async save(transaction?: Transaction) {
    if (this.ref) {
      return transaction
        ? transaction.update(this.ref, this.generateOrmEntity())
        : updateDoc(this.ref, this.generateOrmEntity());
    } else {
      throw new Error("Document Reference not set!");
    }
  }

  async get(transaction?: Transaction) {
    if (this.ref) {
      return transaction ? transaction.get(this.ref) : getDoc(this.ref);
    } else {
      throw new Error("Document Reference not set!");
    }
  }

  async create(collection: CollectionReference, transaction?: Transaction) {
    if (!this.ref) {
      this.ref = await addDoc(collection, this.generateOrmEntity());
    } else {
      await (transaction
        ? transaction.set(doc(collection, this.id), this.generateOrmEntity())
        : setDoc(doc(collection, this.id), this.generateOrmEntity()));
    }
  }
}
