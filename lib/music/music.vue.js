import m from './index';
m.install = (Vue, { method = true, component = true, componentName = 'g-music-component' } = {}) => {
  if (method) {
    Vue.prototype.musicObject = m;
  }
  if (component) {
    let id = 0;
    Vue.component(componentName, {
      data() {
        return {
          mo: null, // musicObject
          id: id++,
        };
      },
      props: ['msrc', 'activeClassName', 'className', 'pause', 'autoplay', 'loop', 'replay', 'mute'],
      computed: {
        generateId() {
          return `${componentName}-${this.id}`;
        },
      },
      methods: {
        inject(src, conf) {
          m
            .inject(src, conf)
            .then(mo => {
              this.mo = mo;
            })
            .catch(e => {
              throw e;
            });
        },
      },
      template:
        '<div v-bind:id="generateId" v-msrc="msrc" v-pause="pause" v-autoplay="autoplay" v-loop="loop" v-replay="replay" v-mute="mute"></div>',
      directives: {
        msrc: {
          update(el, { value, oldValue }, { context }) {
            if (value !== oldValue) {
              console.log(context);
              if (context.mo) {
                context.mo.load(value);
              }
            }
          },
        },
        pause: {
          update(el, { value, oldValue }, { context }) {
            if (value !== oldValue) {
              console.log(context);
              let boolean = !!value;
              if (context.mo) {
                if (boolean) {
                  context.mo.pause();
                } else {
                  context.mo.play();
                }
              }
            }
          },
        },
        replay: {
          update(el, { value, oldValue }, { context }) {
            let boolean = !!value;
            if (context.mo) {
              if (boolean) {
                context.mo.replay();
              }
            }
          },
        },
        loop: {
          update(el, { value, oldValue }, { context }) {
            if (value !== oldValue) {
              let boolean = !!value;
              if (context.mo) {
                context.mo.loop = boolean;
              }
            }
          },
        },
        mute: {
          update(el, { value, oldValue }, { context }) {
            if (value !== oldValue) {
              let boolean = !!value;
              if (context.mo) {
                context.mo.el.muted = boolean;
              }
            }
          },
        },
        autoplay: {
          update(el, { value, oldValue }, { context }) {
            if (value !== oldValue) {
              let boolean = !!value;
              if (context.mo) {
                context.mo.autoplay = boolean;
              }
            }
          },
        },
      },
      mounted() {
        let conf = {
          injectAt: this.generateId,
        };

        if (this.activeClassName !== undefined) {
          conf.activeClassName = this.activeClassName;
        }

        if (typeof this.className !== undefined) {
          conf.className = this.className;
        }

        if (typeof this.autoplay !== undefined) {
          if (this.autoplay === 'false') {
            conf.autoplay = false;
          }
        }

        if (typeof this.loop !== undefined) {
          if (this.loop === 'false') {
            conf.loop = false;
          }
        }

        this.musicObject.inject(this.msrc, conf).then(mo => {
          this.mo = mo;
          this.$emit('init');
        });
      },
      destroy() {
        if (this.mo) {
          this.mo.destory();
        }
      },
    });
  }
};

export default m;
