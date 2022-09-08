export class MapType<K, V> extends Map<K, V> {
  // for firebase
  /**
   * Outputs the contents of the map to a JSON object
   *
   * @returns {{[key: string]: V}}
   * @memberof MapType
   */
  public toJSON(): { [key: string]: V } {
    const obj: any = {};

    const getValue = (value: any): any => {
      if (value instanceof MapType) {
        return value.toJSON();
      } else if (Array.isArray(value)) {
        return value.map((v) => getValue(v));
      } else {
        return value;
      }
    };

    for (const [key, value] of this) {
      obj[key as K] = getValue(value);
    }
    return obj;
  }

  public hasValue(key: K) {
    return this.has(key);
  }

  public setValue(key: K, value: V) {
    this.set(key!, value!);
  }

  public getValue(key: K) {
    return this.get(key);
  }

  public removeValue(key: K) {
    this.delete(key);
  }
}

export type TSMapType = {
  [key: string]: any;
};
