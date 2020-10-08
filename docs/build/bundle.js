
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (32:5) {:else}
    function create_else_block(ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[6].levelMin + "";
    	let t0;
    	let t1;
    	let t2_value = /*option*/ ctx[6].levelMax + "";
    	let t2;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text("-");
    			t2 = text(t2_value);
    			option.__value = option_value_value = /*option*/ ctx[6];
    			option.value = option.__value;
    			add_location(option, file, 32, 6, 718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ifData*/ 2 && t0_value !== (t0_value = /*option*/ ctx[6].levelMin + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*ifData*/ 2 && t2_value !== (t2_value = /*option*/ ctx[6].levelMax + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*ifData*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[6])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(32:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:5) {#if option.levelMin === option.levelMax}
    function create_if_block_1(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[6].levelMax + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[6];
    			option.value = option.__value;
    			add_location(option, file, 30, 6, 649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ifData*/ 2 && t_value !== (t_value = /*option*/ ctx[6].levelMax + "")) set_data_dev(t, t_value);

    			if (dirty & /*ifData*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[6])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(30:5) {#if option.levelMin === option.levelMax}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#each ifData.abilities.intelligence as option}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[6].levelMin === /*option*/ ctx[6].levelMax) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(29:4) {#each ifData.abilities.intelligence as option}",
    		ctx
    	});

    	return block;
    }

    // (38:3) {#if selectedIntelligence.spellChance > 0}
    function create_if_block(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*selectedIntelligence*/ ctx[2].spellChance + "";
    	let t1;
    	let t2;
    	let t3_value = /*selectedIntelligence*/ ctx[2].minNum + "";
    	let t3;
    	let t4;
    	let t5_value = /*selectedIntelligence*/ ctx[2].maxNum + "";
    	let t5;
    	let t6;
    	let t7_value = /*selectedIntelligence*/ ctx[2].maxLevel + "";
    	let t7;
    	let t8;
    	let t9;
    	let button;
    	let t11;
    	let pre;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Chance=");
    			t1 = text(t1_value);
    			t2 = text("%, \n\t\t\t\tMin=");
    			t3 = text(t3_value);
    			t4 = text(", \n\t\t\t\tMax=");
    			t5 = text(t5_value);
    			t6 = text(", \n\t\t\t\tMaxLevel=");
    			t7 = text(t7_value);
    			t8 = text(".");
    			t9 = space();
    			button = element("button");
    			button.textContent = "Generate Spellbook";
    			t11 = space();
    			pre = element("pre");
    			pre.textContent = `${/*spellBookOutput*/ ctx[3]}`;
    			attr_dev(div, "class", "selectedIntelligence");
    			add_location(div, file, 38, 3, 872);
    			add_location(button, file, 45, 3, 1096);
    			attr_dev(pre, "id", "spellBook");
    			add_location(pre, file, 47, 3, 1165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, t7);
    			append_dev(div, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, pre, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*generateSpellBook*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedIntelligence*/ 4 && t1_value !== (t1_value = /*selectedIntelligence*/ ctx[2].spellChance + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*selectedIntelligence*/ 4 && t3_value !== (t3_value = /*selectedIntelligence*/ ctx[2].minNum + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*selectedIntelligence*/ 4 && t5_value !== (t5_value = /*selectedIntelligence*/ ctx[2].maxNum + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*selectedIntelligence*/ 4 && t7_value !== (t7_value = /*selectedIntelligence*/ ctx[2].maxLevel + "")) set_data_dev(t7, t7_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(pre);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(38:3) {#if selectedIntelligence.spellChance > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let header;
    	let h1;
    	let t0_value = /*appData*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let main;
    	let h2;
    	let t5;
    	let select;
    	let option;
    	let t7;
    	let t8;
    	let footer;
    	let small;
    	let t9;
    	let t10_value = /*appData*/ ctx[0].version + "";
    	let t10;
    	let mounted;
    	let dispose;
    	let each_value = /*ifData*/ ctx[1].abilities.intelligence;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*selectedIntelligence*/ ctx[2].spellChance > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			header = element("header");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Misc tools for playing OD&D by way of Iron Falcon.";
    			t3 = space();
    			main = element("main");
    			h2 = element("h2");
    			h2.textContent = "Extended Spell List";
    			t5 = text("\n\t\t\t\n\t\t\tIntelligence:\n\t\t\t");
    			select = element("select");
    			option = element("option");
    			option.textContent = "--- Please select ---";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			footer = element("footer");
    			small = element("small");
    			t9 = text("© 2020 Scott Maclure. MIT License. Version ");
    			t10 = text(t10_value);
    			attr_dev(h1, "class", "svelte-1x2ts6y");
    			add_location(h1, file, 18, 3, 294);
    			add_location(p, file, 19, 3, 322);
    			add_location(header, file, 17, 2, 282);
    			add_location(h2, file, 23, 3, 405);
    			option.__value = "--- Please select ---";
    			option.value = option.__value;
    			add_location(option, file, 27, 4, 505);
    			if (/*selectedIntelligence*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file, 26, 3, 458);
    			attr_dev(main, "class", "svelte-1x2ts6y");
    			add_location(main, file, 22, 2, 395);
    			add_location(small, file, 53, 3, 1244);
    			add_location(footer, file, 52, 2, 1232);
    			attr_dev(div0, "class", "item svelte-1x2ts6y");
    			add_location(div0, file, 15, 1, 260);
    			attr_dev(div1, "class", "container svelte-1x2ts6y");
    			add_location(div1, file, 13, 0, 234);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, header);
    			append_dev(header, h1);
    			append_dev(h1, t0);
    			append_dev(header, t1);
    			append_dev(header, p);
    			append_dev(div0, t3);
    			append_dev(div0, main);
    			append_dev(main, h2);
    			append_dev(main, t5);
    			append_dev(main, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedIntelligence*/ ctx[2]);
    			append_dev(main, t7);
    			if (if_block) if_block.m(main, null);
    			append_dev(div0, t8);
    			append_dev(div0, footer);
    			append_dev(footer, small);
    			append_dev(small, t9);
    			append_dev(small, t10);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*appData*/ 1 && t0_value !== (t0_value = /*appData*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*ifData*/ 2) {
    				each_value = /*ifData*/ ctx[1].abilities.intelligence;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedIntelligence, ifData*/ 6) {
    				select_option(select, /*selectedIntelligence*/ ctx[2]);
    			}

    			if (/*selectedIntelligence*/ ctx[2].spellChance > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*appData*/ 1 && t10_value !== (t10_value = /*appData*/ ctx[0].version + "")) set_data_dev(t10, t10_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { appData } = $$props;
    	let { ifData } = $$props;
    	let selectedIntelligence = {};
    	let spellBookOutput = [];

    	function generateSpellBook() {
    		console.log("generateSpellBook, selectedIntelligence:", selectedIntelligence);
    	}

    	const writable_props = ["appData", "ifData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selectedIntelligence = select_value(this);
    		$$invalidate(2, selectedIntelligence);
    		$$invalidate(1, ifData);
    	}

    	$$self.$$set = $$props => {
    		if ("appData" in $$props) $$invalidate(0, appData = $$props.appData);
    		if ("ifData" in $$props) $$invalidate(1, ifData = $$props.ifData);
    	};

    	$$self.$capture_state = () => ({
    		appData,
    		ifData,
    		selectedIntelligence,
    		spellBookOutput,
    		generateSpellBook
    	});

    	$$self.$inject_state = $$props => {
    		if ("appData" in $$props) $$invalidate(0, appData = $$props.appData);
    		if ("ifData" in $$props) $$invalidate(1, ifData = $$props.ifData);
    		if ("selectedIntelligence" in $$props) $$invalidate(2, selectedIntelligence = $$props.selectedIntelligence);
    		if ("spellBookOutput" in $$props) $$invalidate(3, spellBookOutput = $$props.spellBookOutput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		appData,
    		ifData,
    		selectedIntelligence,
    		spellBookOutput,
    		generateSpellBook,
    		select_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { appData: 0, ifData: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*appData*/ ctx[0] === undefined && !("appData" in props)) {
    			console_1.warn("<App> was created without expected prop 'appData'");
    		}

    		if (/*ifData*/ ctx[1] === undefined && !("ifData" in props)) {
    			console_1.warn("<App> was created without expected prop 'ifData'");
    		}
    	}

    	get appData() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appData(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ifData() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ifData(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var title = "OD&D Tools";
    var version = "08 Oct 2020 09:30:08";
    var appData = {
    	title: title,
    	version: version
    };

    var abilities = {
    	intelligence: [
    		{
    			levelMin: 3,
    			levelMax: 4,
    			spellChance: 20,
    			minNum: 2,
    			maxNum: 3,
    			maxLevel: 5
    		},
    		{
    			levelMin: 5,
    			levelMax: 7,
    			spellChance: 30,
    			minNum: 2,
    			maxNum: 4,
    			maxLevel: 5
    		},
    		{
    			levelMin: 8,
    			levelMax: 9,
    			spellChance: 40,
    			minNum: 3,
    			maxNum: 5,
    			maxLevel: 5
    		},
    		{
    			levelMin: 10,
    			levelMax: 11,
    			spellChance: 50,
    			minNum: 4,
    			maxNum: 6,
    			maxLevel: 5
    		},
    		{
    			levelMin: 12,
    			levelMax: 12,
    			spellChance: 50,
    			minNum: 4,
    			maxNum: 6,
    			maxLevel: 6
    		},
    		{
    			levelMin: 13,
    			levelMax: 13,
    			spellChance: 65,
    			minNum: 5,
    			maxNum: 8,
    			maxLevel: 6
    		},
    		{
    			levelMin: 14,
    			levelMax: 14,
    			spellChance: 65,
    			minNum: 5,
    			maxNum: 8,
    			maxLevel: 7
    		},
    		{
    			levelMin: 15,
    			levelMax: 15,
    			spellChance: 75,
    			minNum: 6,
    			maxNum: 10,
    			maxLevel: 7
    		},
    		{
    			levelMin: 16,
    			levelMax: 16,
    			spellChance: 75,
    			minNum: 6,
    			maxNum: 10,
    			maxLevel: 8
    		},
    		{
    			levelMin: 17,
    			levelMax: 17,
    			spellChance: 85,
    			minNum: 7,
    			maxNum: 99,
    			maxLevel: 8
    		},
    		{
    			levelMin: 18,
    			levelMax: 18,
    			spellChance: 95,
    			minNum: 8,
    			maxNum: 99,
    			maxLevel: 9
    		}
    	]
    };
    var ifData = {
    	abilities: abilities
    };

    const app = new App({
    	target: document.body,
    	props: {
    		appData: appData,
    		ifData: ifData
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
