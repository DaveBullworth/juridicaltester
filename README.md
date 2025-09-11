# Учебник по TypeScript

## Оглавление

-   [Введение](#введение)
-   [The Basics](#the-basics)
-   [Everyday Types](#everyday-types)
-   [Типы по умолчанию](#типы-по-умолчанию)
-   [Опциональные аргументы](#опциональные-аргументы)
-   [Контекстная типизация](#контекстная-типизация)
-   [Union Types](#union-types)
-   [Отличия `type` и `interface`](#отличия-type-и-interface)
-   [Объединение интерфейсов](#объединение-интерфейсов)
-   [Расширение типов через пересечения](#расширение-типов-через-пересечения)
-   [Мягкое объединение типов (Merge)](#мягкое-объединение-типов-merge)
-   [Type Assertion (касты)](#type-assertion-касты)
-   [Satisfies](#satisfies)
-   [Literal Types](#literal-types)
-   [Non-null Assertion](#non-null-assertion-)
-   [typeof](#typeof)
-   [Приведение к boolean](#приведение-к-boolean)
-   [Narrowing & Type Guards](#narrowing--type-guards)
    - [Проверка с помощью `in`](#проверка-с-помощью-in)
    - [Проверка с помощью `instanceof`](#проверка-с-помощью-instanceof)
    - [Type Predicates](#type-predicates)
    - [Discriminated Unions](#discriminated-unions)
-   [typeof и keyof как TS инструменты](#typeof-и-keyof-как-ts-инструменты)
-   [Утилитарные типы для функций](#утилитарные-типы-для-функций)
-   [Supertype & Subtype](#supertype--subtype)
-   [Проверка exhaustive с `never`](#проверка-exhaustive-с-never)
-   [Проверка возможно ли пересечение типов](#проверка-возможно-ли-пересечение-типов)
-   [Generics](#generics)
-   [Условные типы (Conditional Types)](#условные-типы-conditional-types)
    - [Excess Property Checks](#excess-property-checks)
-   [Enum-подобные объекты](#enum-подобные-объекты)
-   [Кортежи (Tuples)](#кортежи-tuples)
-   [Mapped Types](#mapped-types)
-   [Утилитарные типы (встроенные)](#утилитарные-типы-встроенные)
-   [Проверка значений через `asserts`](#проверка-значений-через-asserts)
-   [Перегрузка функций (Function Overload)](#перегрузка-функций-function-overload)
-   [Infer](#infer)

------------------------------------------------------------------------

## Введение

Этот учебник создан на основе конспекта и предназначен для изучения
языка **TypeScript**.
Каждая тема сопровождается пояснениями, кодовыми примерами и заметками.

------------------------------------------------------------------------

## The Basics

### Основные настройки tsconfig:

-   `strict` --- включает `noImplicitAny` и `strictNullChecks`
-   `target` --- версия JS для компиляции (es3, es5, es6/es2015, es2016, es2017, es2018, es2019, es2020, es2021, es2022, es2023, es2024, or esnext)
-   `noEmitOnError` --- не генерирует JS файлы при ошибках во время компиляции `tsc`
-   `noEmit` --- не генерирует JS файлы никогда (используется если проект уже собирается сборщиком по типу *vite*, *webpack* и т.д.)
-   `noImplicitAny` --- запрещает неявный `any`
-   `strictNullChecks` --- строгая работа с `null` и `undefined`

------------------------------------------------------------------------

## Everyday Types

### 8 основных типов:

#### Примитивы

-   `string`
-   `number`
-   `boolean`
-   `bigint`
-   `symbol`
-   `null`
-   `undefined`

#### Ссылочный

-   `object` (объекты, функции, массивы, кортежи)

### Специальные типы (только для TypeScript):

-   `any` --- надтип и подтип для всего
-   `unknown` --- надтип для всех других типов (на `unknown` можно
    присвоить что угодно, ничему нельзя присвоить unknown)
-   `never` --- подтип для всех других типов (ничего нельзя присвоить в
    `never`, но `never` можно присвоить в любой тип)
-   `void` --- функция которая ничего не возвращает, возвращает тип void(чтобы обозначить что функция ничего не должна возвращать) (надтип/подтип как у `never`)
-   **Литералы** --- отдельная категория

### Группы типов:

-   Примитивы
-   Составные (`objects`, `arrays`, `functions` и т.д.)
-   Специальные (`any`, `unknown`, `never`, `void`)
-   Литералы
-   `Union` / `Intersection` (`A | B`, `A & B`)
-   Дженерики (Generics)

------------------------------------------------------------------------

### Типы по умолчанию

Если не указывать тип и не присваивать значение, TypeScript использует
`any`.

📌 Важно: даже если не указывать типы параметров функции, TS всё равно проверяет количество передаваемых аргументов.

### Когда указывать возвращаемый тип функции:

-   Если функция большая и сложная.
-   Если нужен контракт — чтобы при изменении кода реализации функции, котороё ведёт за собой изменение возвращаемого типа TS сразу ругался.
-   Если возвращаемое значение асинхронное (см. ниже про Promise).

⚠ async всегда оборачивает результат в Promise:

``` ts
async function f() {
  return 42;
}

// Эквивалентно
function f(): Promise<number> {
  return Promise.resolve(42);
}
```

⚠ При аннотации возвращаемого типа у `async`-функций всегда нужно писать
`Promise<Type>`, а не просто `Type`.

> Для того чтобы сразу вынять возвращаемый тип из промиса или цепочки промисов, можно использовать утилитарный тип `Awaited<Type>`

------------------------------------------------------------------------

### Опциональные аргументы

Есть 2 способа сделать аргументы у функции опциональными:
1. `name?: string` - `?` после аргумента, обозначает что он опциональный (может не передаваться).
⚠ Важно помнить что обязательный аргумент не может идти после необязательного.
2. `name: string = "stranger"` - дефолтное значение аргумента.

``` ts
function greet(name?: string) {}
function greet(name: string = "stranger") {}
```

------------------------------------------------------------------------

### Контекстная типизация

TS знает в каком контексте вызывается анонимная функция и не требует деклараций типов аргументов так как уже знает их (вызвали в каком-нибудь методе массива, уже зная тип элементов массива (даже как infered))
это часто встречается:
-   методы массивов (`map`, `filter`, `reduce`);
-   обработчики событий (`onClick`, `onChange`);
-   Promise-цепочки (`.then()`, `.catch()`).

``` ts
type Person = { first: string; last?: string };
```

-   `last?: string` эквивалентно `last: string | undefined`

------------------------------------------------------------------------

### Union Types

TypeScript разрешает операции только если они валидны для **каждого
члена union-типа**.
*например при вызове каких-либо методов у аргумента union-типа в функции*

*синтаксический сахар*: `|x|y` - `|` - можно указывать и перед первым элементом union-типа

------------------------------------------------------------------------

### Отличия `type` и `interface`:

-   У **interface** нет `=` в синтаксисе
-   **type** уникален (нельзя переоткрыть), **interface** можно
    расширять
-   Интерфейсы расширяются через `extends`
-   Типы расширяются через `&` пересечения
-   `interface` нельзя использовать с примитивами или литералами (нельзя делать `extends` с ними, нельзя объявлять их)
-   Можно объявлять интерфейс с одним названием много раз, потом его поля во всех объявлениях просто объединятся
-   Название типа должно быть уникальное
-   Функции типизировать тоже лучше через `type`, а не `interface` (хотя возможно)


Пример расширения интерфейса:
``` ts
interface A extends B { name: string }
```

------------------------------------------------------------------------

### Объединение интерфейсов

``` ts
interface Window { title: string }
interface Window { ts: TypeScriptAPI }

const src = 'const a = "Hello World"';
window.ts.transpileModule(src, {});
```

------------------------------------------------------------------------

### Расширение типов через пересечения

``` ts
type Animal = { name: string }
type Bear = Animal & { honey: boolean }

const bear = getBear();
bear.name;
bear.honey;
```

------------------------------------------------------------------------

### Мягкое объединение типов (Merge)
При таком объединении все поля что есть в обеих составных типах станут обязательным в итоговом, а остальные будут опциональными.

``` ts
type Merge<T, U> = {
  [K in keyof T | keyof U]:
    K extends keyof U
      ? K extends keyof T
        ? T[K] | U[K]
        : U[K]
      : K extends keyof T
        ? T[K]
        : never;
};

type UserEmployee = Merge<User, Employee>;
```

------------------------------------------------------------------------

### Type Assertion (касты)

#### Смысл кастов:
Каст (as) — это инструкция компилятору: "Относись к этому значению как к типу X".
> TypeScript НЕ делает преобразования данных!

Использование допустимо в:
-   Конфиги (*webpack*, *vite*, ..)
-   Тесты (надо воспроизвести часть типа, необходимого для теста)
-   Работа с *html* элементами
-   Утилитарные функции (хэлпер использующий *generic*)
-   Когда ТС не может вывести тип

(если я знаю что это будет не просто HTMLElement а HTMLCanvasElement)

``` ts
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
const myCanvas = <HTMLCanvasElement>document.getElementById("main_canvas"); // (можно если файл не .tsx)
```

(ещё валидный пример)

``` ts
const input = document.querySelector("#username");
// input: Element | null

// Кастим к конкретному типу, чтобы получить доступ к .value
const username = (input as HTMLInputElement).value;
```


⚠ TypeScript не меняет данные, а только «убеждает» компилятор.
⚠ TypeScript допускает только касты, которые сужают или расширяют тип. (т.е. нельзя делать `const x = "hello" as number;`)
> но это можно обойти с помощью цепочки через `any` (или `unknown`) (даже если стоит `noImplicitAny : true`) :
 ``` ts 
 const a = expr as any as T;
 const a = expr as unknown as T;
 ```

------------------------------------------------------------------------

### Satisfies

для проверки совпадения структуры объекта со сравниваемым типом (как проверка удовлетворяет ли переменная указанному типу)

``` ts
interface Person {
  age: number;
  username: string;
  password: string;
}

const obj = {
  age: 11,
  username: "Anton",
  password: "1234a"
} satisfies Person;
```

------------------------------------------------------------------------

### Literal Types

Литералы позволяют использовать **строгие значения** вместо общих типов.
*Просто значения как у переменных (смысл когда в **union** типе (чаще безымянные, можно и именовать)) можно комбинировать с обычными типами.*

Виды литералов:
-   Строковые (string)
-   Числовые (number)
-   Булевые (boolean)
-   Шаблонные строковые - (добавлять в шаблонную строку другой литерал `text ${Примитивный тип}`)
-   Составные

Примеры: `"GET"`, `42`, `true`

``` ts
let method: "GET" | "POST";
method = "GET";
```

> Значение поле объекта может и совпадать с каким-то Literal типом но если оно другого типа то это всё равно ошибка, так как значения полей объекта может меняться. Это можно решить либо:
1. В объявлении (присвоении) объекта и в использовании нужного поля объекта добавлять **Type Assertions** - "as НужныйТип" (method: "GET" as "GET". req.method as "GET")
2. Использовать **"as const"**. *Суффикс as const действует как const, но для системы типов, гарантируя, что всем свойствам присваивается литеральный тип, а не более общий вариант, такой как `string` или `number`.*
3. !!!ЕСЛИ ХОТИМ ТОЛЬКО ОДНО КОНКРЕТНОЕ ПОЛЕ!!! то используем синтаксис **"readonly"**. (`readonly id: number`)

#### Напоминание: объекту (не важно let или const!):

-   Нельзя добавлять новые поля после инициализации  *(потому что при инициализации объекту присваивается соответсвующий его структуре тип)*
-   Можно менять значение существующих полей, но только на те что соответсвуют типу полученному при инициализации.
-   (! Переменная !) Чтобы сделать все поля неизменяемыми → `as const` *после объявления обекта*
-   (! Тип !)Чтобы запретить менять одно конкретное поле → `readonly` *перед названием поля*

``` ts
const obj = { id: 1, name: "John" } as const;
type Type = { readonly id: number, name: string }; 
```

------------------------------------------------------------------------

### Non-null Assertion `!`

``` ts
function liveDangerously(x?: number | null) {
    // No error
    console.log(x!.toFixed());
}
```

> ⚠ `x!` говорит TS: "поверь, что x точно не `null` и не `undefined`".
Если `x` будет `undefined` в рантайме → упадёт с ошибкой.
Это **не защита** от `null`, а просто снятие предупреждений TS.

------------------------------------------------------------------------

### typeof

`typeof`(runtime инструмент) в JS возвращает строки:
- "string"
- "number"
- "bigint"
- "boolean"
- "symbol"
- "undefined"
- "object"
- "function"

⚠ `typeof null === "object"` --- старая проблема JS.

#### Приведение к boolean

📌 Надо помнить:

``` ts
Boolean(value); // type - boolean
!!value; // type - true/false
```

⚠ В JS: `null == undefined → true`

------------------------------------------------------------------------

## Narrowing & Type Guards

### Проверка с помощью `in`

Вариант `narrowing` используя оператор `in`, суть которого в проверка что в объекте есть поле с таким названием

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }
  return animal.fly();
}
```

### Проверка с помощью `instanceof`

Вариант `narrowing` используя оператор `x instanceof Foo`, суть которого в проверка что `Foo` является прототипом `x`. (т.е. что `x` принадлежит классу или наследует от него)
⚠ Работает только с классами

```ts
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
  } else {
    console.log(x.toUpperCase());
  }
}
```

### Type Predicates

Функции, которые определяют кастомный тип, синтаксис:
`parameterName is Type`

```ts
// Функция определитель
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

// Но лучше
function isFish(pet: Fish | Bird): pet is Fish {
  return "swim" in pet;
}

// потом используем определитель
let pet = getSmallPet();
if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}
```

### Discriminated Unions

`Narrowing` с помощью исключающих полей

В примере исключающее поле `kind`:

```ts
interface Circle { kind: "circle"; radius: number; }
interface Square { kind: "square"; sideLength: number; }
type Shape = Circle | Square;

// функция понимает что `shape.kind` будет определять какой тип у аргумента `shape` `Circle` или `Square` так как поле `kind` у типа `Shape` есть union: "circle" | "square"
function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

------------------------------------------------------------------------

### typeof и keyof как TS инструменты

```ts
type SomeType = typeof obj; // → получение типа по объекту (тип будет объект с такими же полями и типами полей) (это именно TS инструмент а не runtime JS утилита)
type Keys = keyof SomeType;  // → возвращает union ключей. (* можно комбинировать сразу : `keyof typeof obj`)
type Values = SomeType[keyof SomeType]; // → возвращает union !типов! ключей.
type A = typeof arr[number];  // → возвращает union типов элементов массива. 
/*
arr[number] - индексирование, получение типа элемента массива под индексом соответствующему типу переданному в скобках,
              так как индексы значений массива есть числа, то все они удовлетворяют типу number а значит мы получим union тип по всем типам всех элементов массива.
*если брать typeof arr[1], то получим тип элемента массива под индексом соответсвующим типу 1, т.е. это будет типо второго элемента массива.
*/
```

### Утилитарные типы для функций

Вытаскиваем нужные типы связанные с функцией с помощью утилитарных типов

```ts
function getData(user: User, age: number): string { return "hello!" }

type GetDataFn = typeof getData; // → получение типа функции
type GetDataReturnValue = ReturnType<typeof getData>; // → получение типа возвраащемого значения функции
type GetDataParams = Parameters<typeof getData>; // → получение union - типа аргументов функции
```

Функция которая из объекта по ключу достаёт данные:

```ts
const a = { color: "white", name: "test" }
/*
    K extends keyof T -
    ограничивает generic `K` так чтобы можно было передать только тип который будет соответствовать одному из полей (ключей) типа `T` (поле воспринимается как тип литеральная строка)
*/

function getByKey<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

getByKey(a, "color");
```

------------------------------------------------------------------------

## Supertype & Subtype

Надтип (supertype) и Подтип (subtype)

```ts
type SuperType = { name: string; }
type SubType = { name: string; age: number; }

/// МОЖНО
const subTypeObj: SubType = {name: "Name", age: 33}
const superTypeObj: SuperType = subTypeObj;

/// НЕЛЬЗЯ (потому что у `superTypeObj2` нет поля `age` так как он типа `SuperType`)
const superTypeObj2: SuperType = {name: "Name"}
```

> Можно присваивать от большего к меньшему (теряя поля), но нельзя наоборот (пытаться присвоить тип с большими полями)

### Проверка exhaustive с `never`

Проверка что все варианты обработаны для всяких логических операторов (напр. switch/case, if/else и т.д.):

```ts
const exhaustiveCheck: never = value; // проверка что все варианты обработаны
```
(проверка что `value` будет типа `never` так как такого значения которое попало сюда не может существовать (напр. `default:` в switch/case))

### Проверка возможно ли пересечение типов

```ts
type C = A & B
const value: C // → будет тип `never` если нет такого типа который удовлетворял бы и типу `A` и типу `B` (пример `string` & `number`)
```

------------------------------------------------------------------------

## Generics

Как аргумент для функции, только для типа 

#### Пример для объектов и API

```ts
// Описание интерфейса сущности "Пользователь"
interface User { id: symbol; name: string | null; }
// Описание интерфейса сущности "Заказ"
interface Order { id: symbol; orderNumber: number; comment?: string; }

// Описание интерфейса ответа от сервера на маршруты API для разных сущностей
// можно interface ApiResponse<Data = string> - значение по умолчанию как у функций, чтобы при вызове можно было не передавать и писать - const res: ApiResponse = {data:"test"}
interface ApiResponse<Data> {
  status?: 'error'|'success'|'pending';
  data: Data;
}

// Ответ от сервера на маршрут "Пользователь"
const responseFromUserApi: ApiResponse<User> = {
    data: { id: Symbol(1), name: null }
}

// Ответ от сервера на маршрут "Заказ"
const responseFromOrderApi: ApiResponse<Order> = {
    status: 'pending',
    data: { id: Symbol(1), orderNumber: 12 }
}
```

#### Пример для функций

```ts
// используем запятую `Т,` чтобы jsx не принял это за html тэг
const genericFnc = <T,>(arg: T): boolean => Boolean(arg);

// ограничение типа для generic
// `extends` говорит о том что обязательно должно быть у передаваемого типа (T расширяет {key: type}, значит у T точно есть key: type и может что-то ещё)
function test<T extends { name: string | null }>(arg: T) {}
test<User>({id: Symbol(3), name: null})
```

------------------------------------------------------------------------

## Условные типы (Conditional Types)

```ts
type IsArray<T> = T extends any[] ? true : false;

const first: IsArray<string> = false; // true быть не может
const second: IsArray<string[]> = true; // false быть не может
```

---

### Пример с интерфейсом User

```ts
interface User {
    name?: string
}

/* Проверяем если передан интерфейс соответсвующий интерфейсу `User`
 - если !да то тип `SomeType` будет объект с полем `value` и типом у поля - число
 - если !нет то тип `SomeType` будет объект с полем `value` и типом у поля - строка
*/
type SomeType<T> = T extends User ? {value: number} : {value: string}

// Проверяем, по тому будет ли TS ругаться на присвоение
const third: SomeType<User> = {value: 12}; // - передали `User` = `User` - тип будет, где `value` - число
const fourth: SomeType<Date> = {value: 'abc'}; // - передали `Date` != `User` - тип будет, где `value` - строка
const fifth: SomeType<{name: "abc"}> = {value: 12}; // - передали `{name: "abc"}` (это подходит под интерфейс `User`, т.к. допустимо присутствие поля `name` с типом - строка) = `User` - тип будет, где `value` - число
const sixth: SomeType<{}> = {value: 12}; // - передали `{}` (это подходит под интерфейс `User`, т.к. допустимо отсутствие поля `name`) = `User` - тип будет, где `value` - число
const seventh: SomeType<{name: 12}> = {value: 'abc'}; // - передали `{name: 12}` (это НЕ подходит под интерфейс `User`, т.к. в интерфейсе `User` поле `name` может либо отсутствовать либо быть строкой) != `User` - тип будет, где `value` - число
```

#### Excess Property Checks

Object literals получают особую проверку на лишние поля при присвоении:

```ts
const eighth: SomeType<{color: "white"}> = {value: "abc"}; // - !!! ОСОБЕННОСТЬ "Excess Property Checks" ОБЪЯСНЯЕТСЯ НИЖЕ !!!
/* Excess Property Checks
Объектные литералы обрабатываются особым образом и подвергаются дополнительной проверке свойств при присвоении их другим переменным или передаче их в качестве аргументов.
Если объектный литерал обладает какими-либо свойствами, которых нет у “целевого типа”, вы получите сообщение об ошибке.
→ TS проверяет, что в нём нет лишних свойств, которых нет в интерфейсе.
Если лишние свойства есть → не совместим.
const a: User = { color: "white"}; // - Object literal may only specify known properties, and 'color' does not exist in type 'User'.
*/

// Можно обойти `Excess Property Checks` если присвоить значение (объект) другой переменной заранее и передать её для проверки
const a = {color: "white", name: "test"} // проинициализировали заранее объект `a` и получили infered тип от TS по структурной типизации
const b: User = a;  // проинициализировали переменную `b` и указали тип User. Ошибок нет, так как по логике надтипов/подтипов тип объекта `a` расширяет тип `User`
const ninth: SomeType<typeof a> = {value: 22}; // - работает потому что для `a` не вызывалась проверка на лишние поля, так как он был проинициализирован ранее

/* !!!НО!!!
Если у объекта не будет ни одного общего поля с проверяемым типом, то будет опять не соответствие:
*/
const a1 = {color: "white"}
const b1: User = a1;
const tenth: SomeType<typeof a1> = {value: "abc"};  // - потому что у `a1` нет ни одного поля совместимого с интерфейсом `User`
```

> ℹ️ Если объект не имеет **ни одного общего поля** с интерфейсом, то он несовместим.

---

### Ограничения generic

Огрничение для пердаваемого generic как на объект стоит писать исключительно как:

```ts
<T extends object>
```

------------------------------------------------------------------------

## Enum-подобные объекты

среди перечислений enum, const enum и const object лучше использовать последнее:

```ts
const theme = {
    DARK: "dark",
    LIGHT: "light",
    SYSTEM: "system"
} as const;

type Theme = typeof theme[keyof typeof theme];

function setTheme(theme: Theme): void {
    console.log(`Now your theme type is ${theme}!`);
}

setTheme(theme.DARK); // "Now your theme type is dark!"
```

#### Объяснение шагов

1.  typeof them --> {
        readonly DARK: "dark",
        readonly LIGHT: "light";
        readonly SYSTEM: "system";
    }
    Это тип объекта `theme`

2.  keyof typeof theme --> "DARK" | "LIGHT" | "SYSTEM"
    Это union всех названий полей (ключей) объектного типа `theme`
    
3.  typeof theme[keyof typeof theme] --> "dark" | "light" | "system"
    theme[keyof typeof theme] - индексация по ключам типа (Возьми объект `theme` и посмотри типы значений всех его ключей) 
    * суть в том что в квадаратных скобках мы передаём по какому индексу (индексам) типа мы обращаемся,
     в данном случае мы говорим что по таким индексам (полям) которые подходят по типу к union типу "DARK" | "LIGHT" | "SYSTEM",
     сами поля (индексы/ключи) типа представляют собой строки названий "DARK", "LIGHT", "SYSTEM" и когда мы передаём union тип "DARK" | "LIGHT" | "SYSTEM",
     то получается что все поля (индексы/ключи) типа подходят и тогда состовляется union тип по всем результатам:
    typeof theme["DARK"] = "dark" (так как он у нас строковый литерал, так как мы объвляли тип с помощью as const),
    typeof theme["LIGHT"] = "light"
    typeof theme["SYSTEM"] = "system"
    получили три типа - 3 строковых литерала. Объедененный тип из них есть union тип "dark" | "light" | "system"


#### Вариант через утилитарный тип. (для вариативности, если требуется много енамоподобных типов)

> Вся логика та же самая но используется generic в касчестве изначального типа из которого будем получать итоговый.

```ts
type ValueOf<T> = T[keyof T];
type Theme_ = ValueOf<typeof theme>;
```
> Вся суть этих действий получить из константного объекта с полями типо enum значения итоговый тип представляющий собой union enum значений
  Можем использовать совместно и сам константый объект и подходящий для него тип (т.е. у типа будут все значений полей константного объекта который играет у нас роль enum)

> Важно, TS не работает с `enum` как с типами с подходом структурной типизацией (типы одинаковой сигнатуры взаимозаменяемы и их названия просто считаются `alias` для друг друга)
  все `enum` уникальны как типы, даже если они идентичны (значение из одного `enum` не получится подставить там где надо использовать тип другого `enum`)

---

### Кортежи (Tuples)

Кортеж это тип в виде массива с фиксированной длиной с заранее определенной структорой:

```ts
type Tuple = [number, string, 5, "abc", null];
// 1-ый элемент - число, 2-ой - строка, 3-ий - литерал число 5, 4-ый - литерал строка "abc", 5-ый - null.
const tuple: Tuple = [12, "a", 5, "abc", null];

// Пример использования: React useState
type SetState<T> = [T, (newValue: T) => void];
```

------------------------------------------------------------------------

## Mapped Types

Mapped Types - утилитарные типы где мы мапимся во всему переданному как generic типу (как метод .map, но по типу)
Тип, заворачивая в который другой тип, получаем тип где все поля становятся `readonly`, опциональные и могут быть `null`

```ts
interface User_ {
    age: number,
    name: string,
    isActive: boolean
}

type ReadonlyType<T> = {
    readonly [K in keyof T]?: T[K] | null;
}

type NewUser = ReadonlyType<User_>;
```

Результат:

```ts
type NewUser = {
  readonly age?: number | null | undefined;
  readonly name?: string | null | undefined;
  readonly isActive?: boolean | null | undefined;
}
```

#### Объяснение шагов
    Утилитарный тип ReadonlyType принимает generic, далее создаёт объектный тип (`readonly`, `?` , `| null` - просто модификаторы)
    (!!! чтобы отменить модификатор надо просто ставить `-` перед ним: `-readonly`, `-?`)
    поле: тип значения
    keyof T - получаем union тип всех названий полей (ключей) объектного типа переданного generic `T` (суть в том что поля типа считаются как строковые литералы и keyof получает union тип их значений)
    keyof User_ = "age" | "name" | "isActive"
    K in Type - по факту тот же синтаксис что и в JS для перебора свойст объекта циклом `for..in`
        for (key in obj) {
        * ... делать что-то с obj[key] ... *
        }
    только для полей (ключей) объектных типов
    K — это параметр, который будет последовательно принимать каждое значение из keyof T.
    in — это итерация по union-типу.
    T[K] — это индексация типа, то есть мы берём тип значения поля K из типа T.

    !!!В такой утилитарный тип больше нельзя добавлять никакие поля!!!


#### Исключение поля

Можно с  помощью Mapped Type и утилитарного типа Exclude исключить необходимое поле (например `type`) у передаваемых типов:

```ts
type WithoutType<T> = {
  [K in keyof T as Exclude<K, 'type'>]: T[K];
}
```

#### Преобразование в методы-геттеры

Можно с  помощью Mapped Type и утилитарного типа Capitalize сделать тип со всеми теми же полями но как геттеры `getKey`:

```ts
type GetMethods<T> = {
   [K in keyof T as `get${Capitalize<string & K>}`]: T[K];
}
```

------------------------------------------------------------------------

## Утилитарные типы (встроенные)

* **Awaited<Type>** — await для типов, рекурсивно разворачивает `Promise` тип

```ts
type A = Awaited<Promise<string>>;          // string
type B = Awaited<Promise<Promise<number>>>; // number
type C = Awaited<boolean | Promise<number>>;// number | boolean
```

* **Partial<Type>** — делает все поля объектного типа опциональными как с помощью Mapped Type
* **Required<Type>** — делает все поля объектного типа обязательными как с помощью Mapped Type
* **Readonly<Type>** — делает все поля объектного типа неизменяемыми как с помощью Mapped Type
* **Pick<Type, Keys>** — даёт создать тип состоящий только из полей типа `Type` переданных в `Keys` (одно или через union)
* **Omit<Type, Keys>** — даёт создать тип состоящий из всех полей типа `Type`, КРОМЕ переданных в `Keys` (одно или через union)
* **Exclude<UnionType, ExcludedMembers>** — даёт создать union тип состоящий из всех вариантов кроме переданных в `ExcludedMembers` (UnionType может быть и единичным)
* **Extract<Type, Union>** — даёт создать тип из всех типов переданных в `Union` которые есть в `Type`
* **Parameters<Type>** — даёт получить тип-кортеж из аргументов переданной тип функции `Type`
* **ReturnType<Type>** — даёт получить тип который возвращает переданный тип функции `Type`
* **Record<Keys, Type>** — даёт создать объектный тип где каждое поле(ключ) из union типа - ключей `Keys` (проверка что каждый из литералов переданных в `Keys` можно использовать как название поля (ключа)).
		       будет иметь тип переданный в `Type`.
* **Uppercase<StringType> / Lowercase<StringType> / Capitalize<StringType> / Uncapitalize<StringType>** — работа с регистром строковых литералов

------------------------------------------------------------------------

## Проверка значений через `asserts`

Проверка возвращаемого значения функции (их стоит обарачивать в try/catch для валидации типов полученных извне данных, для последующей безопасной работы с ними).
Это типо функции-валидаторы типов (синтаксис: asserts аргумент, asserts аргумент is Тип)(первый для сужения существующего типа (union), второй для явного назначения нового типа.)

#### `asserts condition` (не изменяет тип):

```ts
function assertExists(value: unknown): asserts value {
    if (value === null || value === undefined){
        throw new Error("Value is null or undefined")
    }
}

const name_: string | undefined = "abc";
assertExists(name_); // теперь name_: string
console.log(name_.length); 
```

### `asserts value is Type` (изменяет тип):

```ts
interface User_ {
    age: number,
    name: string,
    isActive: boolean
}

function assertIsUser(data: any): asserts data is User_ {
    if (typeof data !== "object" || data === null){
        throw new Error("Object expected");
    }
    if (typeof data.name !== "string"){
        throw new Error("Property `name` must be a string");
    }
    if (typeof data.age !== "number"){
        throw new Error("Property `age` must be a number");
    }
    if (typeof data.isActive !== "boolean"){
        throw new Error("Property `isActive` must be a boolean");
    }
}
```

------------------------------------------------------------------------

## Перегрузка функций (Function Overload)

Перегрузка функций (function overload): когда мы определяем сразу 2 и более сигнатуры для одной функции для того чтобы вызывать её с разными аргументами (по кол-ву и типу) и получать разный тип возвращаемого значения.
По факту имеет значение только когда нам надо определять какой конкретно возвращать тип в зависимости от типов и кол-ва переданных аргументов,
если мы в любом случае будем всегда возвращать один и тот же тип, то смысла особо нет, разве удобство документации для понимания как можно использовать функцию (варианты будут конкретно разделены а не все в кучу)
**!!!Помни правило!!!**: 2 и более перегрузки и 1 реализация у которой аргументы и возвращаемое значение имеют объедененный тип от всех перегрузок.
*Если вопрос можно решить просто сделав аргумент необязательным то не надо трогать перегрузки.*

Пример:
У нас есть функция `fetchUser`, которая может:
1. Получить всех пользователей → возвращает массив `User[]`.
2. Получить одного пользователя по `id` → возвращает `User | undefined`.

```ts
interface User {
  id: number;
  name: string;
  isActive: boolean;
}

const db: User[] = [
  { id: 1, name: "Alice", isActive: true },
  { id: 2, name: "Bob", isActive: false },
  { id: 3, name: "Charlie", isActive: true },
];

// Перегрузки
function fetchUser(): User[];
function fetchUser(id: number): User | undefined;

// Реализация
function fetchUser(id?: number): User[] | User | undefined {
  if (id !== undefined) {
    return db.find(u => u.id === id);
  }
  return db;
}

// Использование
const allUsers = fetchUser();      // User[]
const singleUser = fetchUser(2);   // User | undefined
const wrong = fetchUser("abc");   // Ошибка компиляции: Argument of type 'string' is not assignable to parameter of type 'number'
```

------------------------------------------------------------------------

## Infer

`infer` позволяет выводить тип внутри условного типа.

```ts
function fn1(arg1: string, arg2: string): string {
    return "Hello!"
}

const array = [1, "abc", null];

type MyParameters<T extends (...args: any) => any> =
  T extends (...arg: infer U) => any ? U : never;

type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer U ? U : never;

type GetArrayItem<T extends any[]> =
  T extends (infer ArrayItemType)[] ? ArrayItemType : never;

// Применение
type FnArg = MyParameters<typeof fn1>;   // [arg1: string, arg2: string]
type FnReturn = MyReturnType<typeof fn1>;// string
type ArrayItem = GetArrayItem<typeof array>; // number | string | null
```

#### Объяснение шагов

1) `infer U`: `infer` выводит тип и "кладёт в букву" `U`
2) `...args` - это JS синтаксис "Остаточные параметры (...)" который нужен чтобы собрать все остальные переданные аргументы кроме указанных до этого в один массив, т.е.:
        function showName(firstName, lastName, ...titles) {
            alert( firstName + ' ' + lastName ); // Юлий Цезарь
            // Оставшиеся параметры пойдут в массив
            // titles = ["Консул", "Император"]
            alert( titles[0] ); // Консул
            alert( titles[1] ); // Император
            alert( titles.length ); // 2
        }
        showName("Юлий", "Цезарь", "Консул", "Император");
3) передаваемый дженерик <T ...> ограничивается чтобы получать ошибку сразу на стадии передачи неподходящего типа
