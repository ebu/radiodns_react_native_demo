# RadioDns Demonstrator Architecture

## A quick recap on React Native
React native is a game changer as it allows us to create rapidly interfaces based on web technologies
rather than working with a native SDK. The strength of this is that React Native does not rely on
webviews like Phonegap, ionic or cordova. It provides instead bindings to use native views, components
and specific device APIs. So when one is writing React Native apps, one builds native UIs.

So bear in mind that even if we are working with TypeScript and JavaScript, under the hood it is 
native mobile that is running:
- One should always test its components on all mobile operating system to
ensure that they are rendered correctly on each one.
- One should always be careful of excessive CPU usage and memory management.
- Upon retrieving data from network one should always implement a caching system for this data as network
queries are an expensive task in terms of battery. 

## Application data flow
### Flux pattern
In order to understand the Redux pattern let us start with the Flux pattern first.
It was introduced by Facebook a few years ago and consists of a unidirectional data flow.

There are 4 main components to the Flux pattern:
1. Actions
2. Dispatcher
3. Stores
4. Views

![Flux Pattern](https://github.com/ebu/radiodns-mobile-demo/raw/android-auto/documentation/images/flux_pattern.png)

When a user interacts with a view, it propagates an action to a central dispatcher. The dispatcher is responsible to propagate actions to one/many store objects.

A store object holds the application state, data and business logic. They must respond to an action being dispatched to 
them and are also responsible to update the views that are affected by that change.

A view holds the responsibility to update accordingly to new data/state, interact with users and fire actions into the
dispatcher.

Note that not only views can fire actions. Results from ajax calls or timer should also be capable of firing actions into
the dispatcher.

### Redux pattern
You can think of Redux as an extension of Flux.

Redux adds 3 new major principles:
1. Single source of truth
2. State is read-only
3. Changes are made with pure functions.

#### Single source of truth
Redux patterns enforce having only a single store per app. One store to contain all the application data and state.

Flux described multiple stores each one being specific to a topic but this pattern can induce some complexity as one may
have to wait for another store to update.

#### State is read-only
Because views and network callbacks can never write directly into the state but rather have to express an intent to do so,
we get a centralized way of handling updates, each happening one by one in a strict order. So this solves problems like race conditions!

#### Changes are made with pure functions
In order to express how state transition occurs, the Redux pattern uses functions called "reducer". All these reducers are pure functions.
A pure function is a function that produces output without changing its inputs. A reducer get the old state and computes a
new one.

#### Data flow
Redux data flow is based on Flux's one but with some changes:

![Redux Pattern](https://github.com/ebu/radiodns-mobile-demo/raw/android-auto/documentation/images/redux_pattern.png)

As you can see we no longer have a central dispatcher but instead action creators that dispatch actions to the store.
The store will then use this action and its reducers to compute a new state. The said state will be then delivered to 
views and they will update accordingly.

This data flow enable one source of truth a pure updates so in the end, we have a predictable data flow that is easier to
use than the Flux pattern.

Find more about [Redux principles here](https://redux.js.org/introduction/core-concepts)!

For more information about Redux's Flux inspiration [go here](https://redux.js.org/introduction/prior-art#flux).

## Application implementation with Redux

![Redux in demonstrator](https://github.com/ebu/radiodns-mobile-demo/raw/android-auto/documentation/images/app_architecture.png)

Following the Redux design pattern, we hold only one source of truth for the state of the application.

Redux store contains
the available Service Providers and their stations, the station currently tuned in if any, etc. React components then
update accordingly to the current state of the app. Any component can also fire an action that will lead to a new state
for the app. And the cycle continues.

You'll notice the "Synchronisation Components". These components are used to synchronise the state of the application
and receive updates to/from outside of react native.
