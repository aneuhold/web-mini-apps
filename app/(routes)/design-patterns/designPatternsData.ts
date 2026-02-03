/**
 * Design pattern flash card data
 */
export interface DesignPattern {
  name: string;
  category: 'Creational' | 'Structural' | 'Behavioral';
  description: string;
  problems: string[];
  solution: string;
  example: string;
  useCases: string[];
}

/**
 * Flash card with a specific problem variation
 */
export interface FlashCard {
  patternName: string;
  category: 'Creational' | 'Structural' | 'Behavioral';
  problem: string;
  description: string;
  solution: string;
  example: string;
  useCases: string[];
}

const patterns: DesignPattern[] = [
  // Creational Patterns
  {
    name: 'Factory Method',
    category: 'Creational',
    description:
      'Defines an interface for creating objects, but lets subclasses decide which class to instantiate.',
    problems: [
      'You need to create different types of UI components (buttons, dialogs) based on the operating system, but you want the creation logic separated from the business logic.',
      "Your logistics app needs to handle different transport types (Truck, Ship, Plane), but you don't want tight coupling between the planning code and specific transport classes.",
      "You're building a document editor that needs to create different document types (PDF, Word, Text), and you want to add new types without modifying existing code."
    ],
    solution:
      'Define a factory method in a base class/interface that returns objects, allowing subclasses to override the method.',
    example: `interface Transport {
  deliver(): string;
}

abstract class Logistics {
  abstract createTransport(): Transport;
  
  planDelivery(): string {
    const transport = this.createTransport();
    return transport.deliver();
  }
}

class TruckLogistics extends Logistics {
  createTransport(): Transport {
    return new Truck();
  }
}`,
    useCases: [
      'UI frameworks with multiple themes',
      'Document processing systems',
      'Plugin architectures',
      'Cross-platform development'
    ]
  },
  {
    name: 'Abstract Factory',
    category: 'Creational',
    description:
      'Provides an interface for creating families of related or dependent objects without specifying their concrete classes.',
    problems: [
      "You're building a cross-platform UI library where each platform (Windows, Mac, Linux) needs its own set of related components (Button, Checkbox, Window) that work together.",
      'Your furniture shop app needs to create sets of products (Chair, Sofa, Table) in different styles (Victorian, Modern, ArtDeco) that are compatible with each other.',
      'You need to generate themed UI elements where all components in a theme must be visually consistent, but you want to support multiple themes.'
    ],
    solution:
      'Create an abstract factory interface with methods for creating each product in the family, then implement concrete factories for each variant.',
    example: `interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class WindowsFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();
  }
  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }
}`,
    useCases: [
      'Cross-platform UI toolkits',
      'Product family management',
      'Theme systems',
      'Database connection factories'
    ]
  },
  {
    name: 'Builder',
    category: 'Creational',
    description: 'Separates the construction of a complex object from its representation.',
    problems: [
      'You need to construct a complex House object with many optional features (swimming pool, garage, garden, statues) and different combinations should be possible.',
      'Your restaurant app needs to build custom meals with many optional components (main course, side dish, drink, dessert, toy) but not all combinations are valid.',
      "You're creating SQL queries programmatically and need to handle optional clauses (WHERE, JOIN, ORDER BY, LIMIT) in a clean way."
    ],
    solution: 'Provide a builder class that constructs the object step by step.',
    example: `class HouseBuilder {
  private house = new House();
  
  buildWalls(): this {
    this.house.walls = 4;
    return this;
  }
  
  buildRoof(): this {
    this.house.roof = 'gable';
    return this;
  }
  
  buildGarage(): this {
    this.house.garage = true;
    return this;
  }
  
  getHouse(): House {
    return this.house;
  }
}`,
    useCases: [
      'Building complex objects with many parameters',
      'Query builders (SQL, MongoDB)',
      'HTML/XML document construction',
      'Configuration objects'
    ]
  },
  {
    name: 'Prototype',
    category: 'Creational',
    description:
      'Lets you copy existing objects without making your code dependent on their classes.',
    problems: [
      'You have complex game objects with many properties and sub-objects, and you need to create copies for things like save states or undo functionality.',
      'Your graphic editor needs to duplicate shapes, but you want the copy functionality to work without knowing the specific shape class.',
      "You're implementing a document system where users can clone existing documents with all their formatting and content as templates."
    ],
    solution:
      'Delegate the cloning process to the objects being cloned by defining a clone method in a common interface.',
    example: `interface Prototype {
  clone(): Prototype;
}

class ConcretePrototype implements Prototype {
  constructor(
    public field1: string,
    public field2: number
  ) {}
  
  clone(): ConcretePrototype {
    return new ConcretePrototype(this.field1, this.field2);
  }
}`,
    useCases: [
      'Object cloning without class dependencies',
      'Reducing subclasses',
      'Dynamic loading',
      'Configuration copying'
    ]
  },
  {
    name: 'Singleton',
    category: 'Creational',
    description:
      'Ensures a class has only one instance and provides a global point of access to it.',
    problems: [
      'You need a database connection pool that should have exactly one instance shared across your entire application to manage resources efficiently.',
      'Your app needs a configuration manager that loads settings from a file once and makes them available globally without multiple file reads.',
      "You're building a logging system that should write to a single log file from anywhere in the application without conflicts."
    ],
    solution:
      'Create a class with a private constructor and a static method that returns the single instance.',
    example: `class DatabaseConnection {
  private static instance: DatabaseConnection;
  
  private constructor() {}
  
  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}`,
    useCases: ['Database connections', 'Configuration managers', 'Logging services', 'Thread pools']
  },

  // Structural Patterns
  {
    name: 'Adapter',
    category: 'Structural',
    description: 'Converts the interface of a class into another interface clients expect.',
    problems: [
      "You want to use a third-party analytics library, but its interface is incompatible with your application's existing analytics interface.",
      'Your app works with XML data, but you need to integrate a new JSON-only API without rewriting your XML-processing code.',
      "You have legacy code with a specific interface, but new code expects a different interface, and you can't modify either."
    ],
    solution: 'Create an adapter class that wraps an object and translates its interface.',
    example: `interface Target {
  request(): string;
}

class Adaptee {
  specificRequest(): string {
    return "Adaptee behavior";
  }
}

class Adapter implements Target {
  constructor(private adaptee: Adaptee) {}
  
  request(): string {
    return this.adaptee.specificRequest();
  }
}`,
    useCases: [
      'Integrating legacy code',
      'Third-party library integration',
      'Database abstraction layers',
      'Cross-platform compatibility'
    ]
  },
  {
    name: 'Bridge',
    category: 'Structural',
    description:
      'Separates an abstraction from its implementation so that the two can vary independently.',
    problems: [
      "You have shapes (Circle, Square) that need to be drawn on different platforms (Windows, Linux, Mac), and you don't want to create a separate class for each combination.",
      'Your remote control system needs to work with different devices (TV, Radio, Speaker), and both remotes and devices should be extendable independently.',
      "You're building a notification system that can send messages via different channels (Email, SMS, Push) with different levels of urgency (Info, Warning, Critical)."
    ],
    solution:
      'Split a large class or set of closely related classes into two separate hierarchies—abstraction and implementation—which can be developed independently.',
    example: `interface Device {
  turnOn(): void;
  turnOff(): void;
}

class RemoteControl {
  constructor(protected device: Device) {}
  
  togglePower(): void {
    this.device.turnOn();
  }
}

class AdvancedRemote extends RemoteControl {
  mute(): void {
    // Advanced feature
  }
}`,
    useCases: [
      'Cross-platform applications',
      'Device drivers',
      'Graphics rendering systems',
      'Database abstraction layers'
    ]
  },
  {
    name: 'Composite',
    category: 'Structural',
    description:
      'Lets you compose objects into tree structures and work with these structures as if they were individual objects.',
    problems: [
      'You need to represent a file system where folders contain files and other folders, and you want to calculate total size recursively without type checking.',
      'Your graphic editor has simple shapes and groups of shapes, and operations like "move" or "draw" should work the same way on both.',
      "You're building an org chart where employees can be individual contributors or managers with subordinates, and salary calculations should work uniformly."
    ],
    solution:
      'Declare a component interface for both simple and complex objects, allowing clients to treat both uniformly.',
    example: `interface Graphic {
  draw(): void;
}

class Circle implements Graphic {
  draw(): void {
    console.log("Drawing circle");
  }
}

class CompositeGraphic implements Graphic {
  private children: Graphic[] = [];
  
  add(graphic: Graphic): void {
    this.children.push(graphic);
  }
  
  draw(): void {
    this.children.forEach(child => child.draw());
  }
}`,
    useCases: [
      'File system hierarchies',
      'GUI component trees',
      'Organization structures',
      'Scene graphs in graphics'
    ]
  },
  {
    name: 'Decorator',
    category: 'Structural',
    description:
      'Attaches additional responsibilities to an object dynamically without modifying its structure.',
    problems: [
      'You have a basic notification system that sends messages, but some users want email, some want SMS, and some want both, plus optional encryption or compression.',
      'Your coffee shop app has a base coffee, and customers can add extras (milk, sugar, whipped cream), with each addition affecting the price differently.',
      'You need to add logging, caching, or authentication to various data sources, but you want to add these features selectively and in different combinations.'
    ],
    solution: 'Wrap the original object with decorator objects that add new behavior.',
    example: `interface DataSource {
  writeData(data: string): void;
  readData(): string;
}

class FileDataSource implements DataSource {
  writeData(data: string): void { /*...*/ }
  readData(): string { return "data"; }
}

class EncryptionDecorator implements DataSource {
  constructor(private source: DataSource) {}
  
  writeData(data: string): void {
    const encrypted = this.encrypt(data);
    this.source.writeData(encrypted);
  }
  
  readData(): string {
    return this.decrypt(this.source.readData());
  }
}`,
    useCases: [
      'Adding features to UI components',
      'Stream processing',
      'Middleware in web frameworks',
      'Adding logging or caching'
    ]
  },
  {
    name: 'Facade',
    category: 'Structural',
    description: 'Provides a simplified interface to a complex subsystem.',
    problems: [
      'Your app needs to convert videos using a complex library with dozens of classes (codec, format, bitrate settings), but most users just want a simple "convert to MP4" function.',
      'You\'re integrating a complex payment system with multiple steps (validation, authorization, settlement, notification), but clients should just call "processPayment".',
      'Your e-commerce system has many subsystems (inventory, shipping, payment, notifications), and placing an order requires coordinating all of them.'
    ],
    solution:
      'Create a facade class that provides simple methods wrapping complex subsystem interactions.',
    example: `class VideoConverter {
  private codec: CodecFactory;
  private format: FormatParser;
  private audio: AudioMixer;
  
  convert(filename: string, format: string): File {
    // Simplifies complex subsystem interactions
    const file = new File(filename);
    const sourceCodec = this.codec.extract(file);
    const destCodec = this.codec.get(format);
    // ... complex operations
    return result;
  }
}`,
    useCases: [
      'API wrappers',
      'Library abstractions',
      'Database access layers',
      'Service orchestration'
    ]
  },
  {
    name: 'Flyweight',
    category: 'Structural',
    description:
      'Lets you fit more objects into available RAM by sharing common parts of state between multiple objects.',
    problems: [
      'Your game has thousands of trees in a forest, but each tree stores identical texture, mesh, and color data, consuming too much memory.',
      'Your text editor represents each character as an object with font, size, and color, but most characters share the same formatting, leading to memory issues.',
      "You're building a particle system with millions of particles that share most properties (sprite, color, physics behavior) but differ only in position and velocity."
    ],
    solution:
      'Extract the intrinsic (shared) state into flyweight objects and store extrinsic (unique) state externally.',
    example: `class TreeType {
  constructor(
    public name: string,
    public color: string,
    public texture: string
  ) {}
  
  draw(canvas: Canvas, x: number, y: number): void {
    // Use shared data with unique coordinates
  }
}

class TreeFactory {
  private static types: Map<string, TreeType> = new Map();
  
  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = \`\${name}_\${color}_\${texture}\`;
    if (!this.types.has(key)) {
      this.types.set(key, new TreeType(name, color, texture));
    }
    return this.types.get(key)!;
  }
}`,
    useCases: [
      'Particle systems',
      'Text rendering',
      'Game entity management',
      'Caching immutable objects'
    ]
  },
  {
    name: 'Proxy',
    category: 'Structural',
    description: 'Provides a surrogate or placeholder for another object to control access to it.',
    problems: [
      "You have a large object (video file, huge dataset) that's expensive to create, and you want to defer its initialization until it's actually needed.",
      'Your service makes calls to a remote server, and you want to add caching, retry logic, or access control without modifying the service code.',
      'You need to log all accesses to a sensitive resource or add permission checks before allowing operations.'
    ],
    solution:
      'Create a proxy class that implements the same interface and controls access to the real object.',
    example: `interface Image {
  display(): void;
}

class RealImage implements Image {
  constructor(private filename: string) {
    this.loadFromDisk();
  }
  
  private loadFromDisk(): void {
    console.log(\`Loading \${this.filename}\`);
  }
  
  display(): void {
    console.log(\`Displaying \${this.filename}\`);
  }
}

class ProxyImage implements Image {
  private realImage: RealImage | null = null;
  
  constructor(private filename: string) {}
  
  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}`,
    useCases: ['Lazy loading', 'Access control', 'Remote proxies (RPC)', 'Caching proxies']
  },

  // Behavioral Patterns
  {
    name: 'Chain of Responsibility',
    category: 'Behavioral',
    description:
      'Lets you pass requests along a chain of handlers, where each handler decides either to process the request or to pass it to the next handler.',
    problems: [
      'Your support system needs to handle tickets, where simple issues go to level 1 support, harder ones to level 2, and critical ones to level 3, with automatic escalation.',
      "You're building a middleware system for HTTP requests where authentication, logging, caching, and validation should be performed in sequence, with each step deciding whether to continue.",
      'Your purchase approval system requires different approval levels based on amount: <$1000 auto-approve, <$10000 needs manager, >$10000 needs director.'
    ],
    solution:
      'Create a chain of handler objects, where each handler contains a reference to the next handler and decides whether to process or forward the request.',
    example: `abstract class Handler {
  private next: Handler | null = null;
  
  setNext(handler: Handler): Handler {
    this.next = handler;
    return handler;
  }
  
  handle(request: string): string | null {
    if (this.next) {
      return this.next.handle(request);
    }
    return null;
  }
}

class ConcreteHandler extends Handler {
  handle(request: string): string | null {
    if (this.canHandle(request)) {
      return \`Handled by \${this.constructor.name}\`;
    }
    return super.handle(request);
  }
}`,
    useCases: [
      'Event handling systems',
      'Middleware pipelines',
      'Approval workflows',
      'Logging chains'
    ]
  },
  {
    name: 'Command',
    category: 'Behavioral',
    description:
      'Encapsulates a request as an object, allowing parameterization and queuing of requests.',
    problems: [
      "You're building a text editor with undo/redo functionality, where each user action (type, delete, format) needs to be reversible.",
      'Your smart home app needs to bind various actions to buttons, schedule commands for later execution, and keep a history of executed commands.',
      'You need to implement a transaction system where operations can be queued, executed in batch, and rolled back if any operation fails.'
    ],
    solution: 'Encapsulate requests as command objects with execute() methods.',
    example: `interface Command {
  execute(): void;
  undo(): void;
}

class CopyCommand implements Command {
  constructor(private editor: Editor) {}
  
  execute(): void {
    this.editor.copy();
  }
  
  undo(): void {
    // Restore previous state
  }
}

class CommandHistory {
  private history: Command[] = [];
  
  push(command: Command): void {
    command.execute();
    this.history.push(command);
  }
  
  undo(): void {
    const command = this.history.pop();
    if (command) command.undo();
  }
}`,
    useCases: [
      'Undo/redo functionality',
      'Transaction systems',
      'Job queues',
      'GUI buttons and menu items'
    ]
  },
  {
    name: 'Iterator',
    category: 'Behavioral',
    description:
      'Lets you traverse elements of a collection without exposing its underlying representation.',
    problems: [
      'You have different collection types (array, tree, graph) and want to provide a uniform way to iterate through them without exposing their internal structure.',
      'Your social network needs to traverse friend lists, but the traversal algorithm should work regardless of how friends are stored (list, graph, etc.).',
      'You want clients to iterate through your collection in different ways (forward, backward, filtered) without modifying the collection class.'
    ],
    solution:
      'Extract the traversal behavior into a separate iterator object that knows how to traverse a specific collection.',
    example: `interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
}

interface Collection<T> {
  createIterator(): Iterator<T>;
}

class ConcreteCollection implements Collection<string> {
  private items: string[] = [];
  
  createIterator(): Iterator<string> {
    return new ConcreteIterator(this.items);
  }
}

class ConcreteIterator implements Iterator<string> {
  private position = 0;
  
  constructor(private collection: string[]) {}
  
  hasNext(): boolean {
    return this.position < this.collection.length;
  }
  
  next(): string {
    return this.collection[this.position++];
  }
}`,
    useCases: [
      'Collection traversal',
      'Tree/graph navigation',
      'Custom iteration logic',
      'Hiding collection structure'
    ]
  },
  {
    name: 'Mediator',
    category: 'Behavioral',
    description:
      'Reduces chaotic dependencies between objects by making them communicate through a mediator object.',
    problems: [
      'Your UI has many components (buttons, text fields, checkboxes) that need to communicate, but direct connections create a tangled web of dependencies.',
      "You're building a chat room where users send messages to each other, but you don't want users to know about all other users directly.",
      "Your aircraft landing system has planes, runways, and control towers that need to coordinate, but planes shouldn't communicate with each other directly."
    ],
    solution:
      'Create a mediator object that encapsulates how a set of objects interact, reducing direct dependencies between them.',
    example: `interface Mediator {
  notify(sender: Component, event: string): void;
}

class DialogMediator implements Mediator {
  constructor(
    private title: TextBox,
    private saveButton: Button
  ) {}
  
  notify(sender: Component, event: string): void {
    if (event === 'textChanged') {
      this.saveButton.setEnabled(this.title.getText().length > 0);
    }
  }
}`,
    useCases: [
      'UI component coordination',
      'Chat systems',
      'Air traffic control',
      'Event bus systems'
    ]
  },
  {
    name: 'Memento',
    category: 'Behavioral',
    description:
      'Lets you save and restore the previous state of an object without revealing the details of its implementation.',
    problems: [
      "Your drawing application needs to implement undo functionality, but you don't want to expose the internal state of complex shape objects.",
      "You're building a game with save points, where the entire game state needs to be saved and restored without violating encapsulation of game objects.",
      'Your text editor needs to save snapshots of document state for version history without exposing document internals to the history management code.'
    ],
    solution:
      'Delegate creating state snapshots to the owner of that state (the originator), producing memento objects that other objects can store.',
    example: `class EditorMemento {
  constructor(
    private readonly state: string,
    private readonly cursorPosition: number
  ) {}
  
  getState(): string {
    return this.state;
  }
}

class Editor {
  private text: string = '';
  
  createMemento(): EditorMemento {
    return new EditorMemento(this.text, 0);
  }
  
  restore(memento: EditorMemento): void {
    this.text = memento.getState();
  }
}`,
    useCases: [
      'Undo/redo mechanisms',
      'Save points in games',
      'Transaction rollback',
      'Version history'
    ]
  },
  {
    name: 'Observer',
    category: 'Behavioral',
    description:
      'Defines a one-to-many dependency between objects so that when one object changes state, all dependents are notified.',
    problems: [
      "Your store app needs to notify customers when products they're interested in come back in stock, but you don't know how many customers are waiting or how they want to be notified.",
      "You're building a dashboard where multiple charts need to update automatically when the underlying data changes, without the data model knowing about specific charts.",
      "Your news agency publishes articles, and various subscribers (email, mobile app, web) need to be notified, but the agency shouldn't depend on specific subscriber types."
    ],
    solution:
      'Create a subject that maintains a list of observers and notifies them of state changes.',
    example: `interface Observer {
  update(subject: Subject): void;
}

class Subject {
  private observers: Observer[] = [];
  private state: string = '';
  
  attach(observer: Observer): void {
    this.observers.push(observer);
  }
  
  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notify(): void {
    this.observers.forEach(o => o.update(this));
  }
  
  setState(state: string): void {
    this.state = state;
    this.notify();
  }
}`,
    useCases: [
      'Event handling systems',
      'Model-View architectures',
      'Publish-subscribe systems',
      'Data binding in UI frameworks'
    ]
  },
  {
    name: 'State',
    category: 'Behavioral',
    description:
      'Lets an object alter its behavior when its internal state changes, appearing as if the object changed its class.',
    problems: [
      'Your document editor has different tools (selection, pen, eraser) and each tool makes the same user actions (click, drag) behave completely differently.',
      "You're building a media player with states (playing, paused, stopped), and the behavior of play/pause buttons changes based on the current state.",
      'Your order system has states (new, paid, shipped, delivered), and valid actions and transitions differ for each state, creating complex conditional logic.'
    ],
    solution:
      'Create separate classes for each state, each implementing the same interface, and delegate state-specific behavior to the current state object.',
    example: `interface State {
  play(): void;
  pause(): void;
}

class PlayingState implements State {
  constructor(private player: AudioPlayer) {}
  
  play(): void {
    console.log("Already playing");
  }
  
  pause(): void {
    this.player.changeState(new PausedState(this.player));
  }
}

class AudioPlayer {
  private state: State;
  
  constructor() {
    this.state = new PausedState(this);
  }
  
  changeState(state: State): void {
    this.state = state;
  }
  
  play(): void {
    this.state.play();
  }
}`,
    useCases: ['State machines', 'UI tool selection', 'Workflow engines', 'Game character states']
  },
  {
    name: 'Strategy',
    category: 'Behavioral',
    description:
      'Defines a family of algorithms, encapsulates each one, and makes them interchangeable.',
    problems: [
      'Your navigation app can calculate routes using different algorithms (fastest, shortest, scenic), and users should be able to switch between them at runtime.',
      'You have an e-commerce site with different payment methods (credit card, PayPal, cryptocurrency), and the payment processing logic differs for each.',
      'Your file compression tool supports multiple algorithms (ZIP, RAR, 7Z), and you want to add new algorithms without modifying the compression code.'
    ],
    solution: 'Define a family of algorithms as separate classes implementing a common interface.',
    example: `interface RouteStrategy {
  buildRoute(a: Point, b: Point): Route;
}

class RoadStrategy implements RouteStrategy {
  buildRoute(a: Point, b: Point): Route {
    // Calculate fastest route by road
  }
}

class WalkingStrategy implements RouteStrategy {
  buildRoute(a: Point, b: Point): Route {
    // Calculate walking route
  }
}

class Navigator {
  constructor(private strategy: RouteStrategy) {}
  
  setStrategy(strategy: RouteStrategy): void {
    this.strategy = strategy;
  }
  
  buildRoute(a: Point, b: Point): Route {
    return this.strategy.buildRoute(a, b);
  }
}`,
    useCases: [
      'Payment processing',
      'Sorting algorithms',
      'Compression algorithms',
      'Validation rules'
    ]
  },
  {
    name: 'Template Method',
    category: 'Behavioral',
    description:
      "Defines the skeleton of an algorithm in a base class but lets subclasses override specific steps without changing the algorithm's structure.",
    problems: [
      'You have data mining algorithms that work on different file formats (CSV, JSON, XML), and all follow the same steps (open, extract, parse, analyze, close) but each step is implemented differently.',
      'Your game has different character classes that all follow the same combat sequence (approach, attack, defend, retreat), but each class implements these steps differently.',
      "You're building document generators where all documents follow the same structure (header, body, footer), but the content of each section varies by document type."
    ],
    solution:
      'Create an abstract base class that defines the template method (the algorithm skeleton) and declares abstract methods for the steps that subclasses must implement.',
    example: `abstract class DataMiner {
  // Template method
  mine(path: string): void {
    const file = this.openFile(path);
    const data = this.extractData(file);
    const analyzed = this.analyzeData(data);
    this.sendReport(analyzed);
    this.closeFile(file);
  }
  
  abstract openFile(path: string): File;
  abstract extractData(file: File): RawData;
  abstract analyzeData(data: RawData): AnalyzedData;
  
  // Hook with default implementation
  sendReport(data: AnalyzedData): void {
    console.log("Sending report");
  }
  
  closeFile(file: File): void {
    // Common implementation
  }
}

class CSVDataMiner extends DataMiner {
  openFile(path: string): File {
    // CSV-specific implementation
  }
  
  extractData(file: File): RawData {
    // CSV-specific extraction
  }
}`,
    useCases: [
      'Frameworks defining algorithm skeletons',
      'Data processing pipelines',
      'Game AI behavior',
      'Document generators'
    ]
  },
  {
    name: 'Visitor',
    category: 'Behavioral',
    description:
      'Lets you separate algorithms from the objects on which they operate by moving the algorithms into separate visitor classes.',
    problems: [
      'You have a complex object structure (like a scene graph with shapes) and need to perform various operations (export to XML, calculate area) without adding methods to shape classes.',
      'Your compiler works with an AST (abstract syntax tree) and needs to perform different operations (type checking, code generation, optimization) on nodes without modifying node classes.',
      "You have an insurance system with different policy types, and you need to calculate different things (premium, risk, coverage) but don't want to add methods to policy classes."
    ],
    solution:
      'Create visitor classes that implement operations for each type of element, and add an accept method to elements that takes a visitor.',
    example: `interface Visitor {
  visitCircle(circle: Circle): void;
  visitSquare(square: Square): void;
}

interface Shape {
  accept(visitor: Visitor): void;
}

class Circle implements Shape {
  constructor(public radius: number) {}
  
  accept(visitor: Visitor): void {
    visitor.visitCircle(this);
  }
}

class AreaCalculator implements Visitor {
  visitCircle(circle: Circle): void {
    const area = Math.PI * circle.radius ** 2;
    console.log(\`Circle area: \${area}\`);
  }
  
  visitSquare(square: Square): void {
    const area = square.side ** 2;
    console.log(\`Square area: \${area}\`);
  }
}`,
    useCases: [
      'Operations on complex object structures',
      'Compiler operations on AST',
      'Export/serialization systems',
      'Reporting across object hierarchies'
    ]
  }
];

/**
 * Generate flash cards from patterns, creating one card per problem variation
 */
export const designPatterns: FlashCard[] = patterns.flatMap((pattern) =>
  pattern.problems.map((problem) => ({
    patternName: pattern.name,
    category: pattern.category,
    problem,
    description: pattern.description,
    solution: pattern.solution,
    example: pattern.example,
    useCases: pattern.useCases
  }))
);
