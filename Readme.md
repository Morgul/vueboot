# VueBoot

VueJS components and directives written using Bootstrap v4, leveraging the official Bootstrap JS.

**Note: This should be considered pre-release software. There will be bugs! (Many of them from Bootstrap v4, in fact)**

### Project Focus

This project is focused on providing useful/convenient VueJS wrappers around existing Bootstrap components. It does not
wrap all of them (because that seems unnecessary), and really only wraps the ones I find the need for. I'm open to
adding new components, but see the [Contributing](#contributing) section for what I'll accept.

## Why?

For two reasons, mostly. First is, I want to use Bootstrap v4 and VueJS v1.0. While 
[VueStrap](http://yuche.github.io/vue-strap) is a very nice looking project, it has not been updated for either VueJS 
v1.0 or Bootstrap v4. I'm crazy, I want to start working on the bleeding edge.

The second reason is a bit more personal, and born out of experience with [UIBootstrap](https://angular-ui.github.io/bootstrap).
The Bootstrap developers put a lot of work into their javascript code, and implementations that replace it with 'native'
framework code, while neat, tend to have many more bugs, especially with regards to positioning. Bootstrap's code get 
more attention by having a larger user base, and therefore I trust it more. And any issue I do have, should be resolved
faster, all things being equal. So, _personally_, I'd rather wrap Bootstrap's javascript, as opposed to replacing it.

## Usage

VueBoot is available on both npm and bower. For complete usage instructions, please see the [Usage](http://morgul.github.io/vueboot#usage)
page on the main site.

## Contributing

Contributions are welcome! I accept pull requests, feature requests (through the issues), and all that. Primarily, I'm
interested in bug fixes or additional features to current components. If you want to add a component, you'll have to 
follow my guideline below.

### Adding components

**Guideline: Is this component new, does it add functionality, or does it significantly improve the syntax for using 
an existing Bootstrap component?**

While I'm ok with adding components, the focus of the goal is using Bootstrap JS. If using the Bootstrap component is
straightforward, I see no reason to wrap it up in VueJS 'just because'. There needs to be some value added. I'm open to
being convinced so don't feel discouraged. If there's any doubt, make an issue requesting it as a feature first, before
putting the work into a pull request.