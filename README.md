# logInterface
RxJS operator that generates interfaces and logs them into console with styling. Simply copy from console into your file

### Example usage (Angular)
```ts
this.http.get('/endpoint').pipe(logInterface('Interface name'))
```
#### Example
```ts
const person = {
    name: 'John',
    lastname: 'Doe',
    age: 30,
    address:{
        street: 'Highroad',
        number: 100
    },
    items: [
        { pencil: true, gloves: true }
    ]
}
of(person).pipe(logInterface('Person')).subscribe()
//will log the followin into console

export interface Person {
  name: string;
  lastname: string;
  age: number;
  address: PersonAddress;
  items: PersonItems[];
}

interface PersonAddress {
  street: string;
  streetNumber: number;
}

interface PersonItems {
  pencil: boolean;
  gloves: boolean;
}


```
