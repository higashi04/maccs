# maccs

# both client and server
- even if English is used to provide instructions, UI output should be on Spanish given customer is Spanish speaker

# on frontend
- keep each component on its separate file unless it's a very specific use case that will not be used anywhere else.
- UI must be responsive and adaptable to every type of screen
- keep api call functions on a separate file per module
- use tailwind css to style components and fontawesome icons are avaliable to use
- use JSDocs to document what each function does

# on backend
- ES modules imports is being used, respect the convention
- each api point and function must have its own JSDoc documentation
- when a model has a createdBy or updatedBy prop it must take the currently logged in username, preferably from the sent credentials
- isAdmin permissions are meant only for application changes like adding new modules, not for what the user does in the app. 