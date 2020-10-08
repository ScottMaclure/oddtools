
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

    const randomArrayItem = (arr) => {
        const idx = Math.floor(Math.random() * arr.length);
        return arr[idx]
    };

    const roll1d100 = () => randomInteger(1, 100);

    const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

    var utils = {
        deepClone,
        randomArrayItem,
        roll1d100
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
    var classes = {
    	magicUser: {
    		startingSpellBook: [
    			{
    				level: 1,
    				spells: [
    					"Read Magic"
    				]
    			},
    			{
    				level: 2,
    				spells: [
    				]
    			},
    			{
    				level: 3,
    				spells: [
    				]
    			},
    			{
    				level: 4,
    				spells: [
    				]
    			},
    			{
    				level: 5,
    				spells: [
    				]
    			},
    			{
    				level: 6,
    				spells: [
    				]
    			},
    			{
    				level: 7,
    				spells: [
    				]
    			},
    			{
    				level: 8,
    				spells: [
    				]
    			},
    			{
    				level: 9,
    				spells: [
    				]
    			}
    		],
    		_spells_comment: "TODO turn these into objects later.",
    		spells: [
    			[
    				"Charm Person",
    				"Detect Magic",
    				"Hold Portal",
    				"Light",
    				"Magic Missile",
    				"Protection from Evil",
    				"Read Languages",
    				"Read Magic",
    				"Shield",
    				"Sleep",
    				"Ventriloquism"
    			],
    			[
    				"Continual Light",
    				"Darkness, 5' Radius",
    				"Detect Evil",
    				"Detect Invisible",
    				"ESP",
    				"Invisibility",
    				"Knock",
    				"Levitate",
    				"Locate Object",
    				"Magic Mouth",
    				"Mirror Image",
    				"Phantasmal Forces",
    				"Pyrotechnics",
    				"Strength",
    				"Web",
    				"Wizard Lock"
    			],
    			[
    				"Clairaudience",
    				"Clairvoyance",
    				"Dispel Magic",
    				"Explosive Runes",
    				"Fire Ball",
    				"Fly",
    				"Haste Spell",
    				"Hold Person",
    				"Infravision",
    				"Invisibility, 10' Radius",
    				"Lightning Bolt",
    				"Monster Summoning I",
    				"Protection from Evil, 10' Radius",
    				"Protection from Normal Missiles",
    				"Rope Trick",
    				"Slow Spell",
    				"Suggestion",
    				"Water Breathing"
    			],
    			[
    				"Charm Monster",
    				"Confusion",
    				"Dimension Door",
    				"Extension I",
    				"Fear",
    				"Growth of Plants",
    				"Hallucinatory Terrain",
    				"Ice Storm",
    				"Massmorph",
    				"Monster Summoning II",
    				"Polymorph Others",
    				"Polymorph Self",
    				"Remove Curse",
    				"Wall Of Fire",
    				"Wall Of Ice",
    				"Wizard Eye"
    			],
    			[
    				"Animate Dead",
    				"Cloudkill",
    				"Conjure Elemental",
    				"Contact Higher Plane",
    				"Extension II",
    				"Feeblemind",
    				"Growth of Animals",
    				"Hold Monster",
    				"Magic Jar",
    				"Monster Summoning III",
    				"Pass-Wall",
    				"Telekinesis",
    				"Teleport",
    				"Transmute Rock to Mud/Transmute Mud to Rock",
    				"Wall of Iron",
    				"Wall of Stone"
    			],
    			[
    				"Anti-Magic Shell",
    				"Control Weather",
    				"Death Spell",
    				"Disintegrate",
    				"Extension III",
    				"Geas",
    				"Invisible Stalker",
    				"Legend Lore",
    				"Lower Water",
    				"Monster Summoning IV",
    				"Move Earth",
    				"Part Water"
    			],
    			[
    				"Charm Plants",
    				"Delayed Blast Fire Ball",
    				"Limited Wish",
    				"Mass Invisibility",
    				"Monster Summoning V",
    				"Phase Door",
    				"Power Word-Stun",
    				"Reverse Gravity",
    				"Simulacrum"
    			],
    			[
    				"Mass Charm",
    				"Clone",
    				"Power Word-Blind",
    				"Symbol",
    				"Permanent Spell",
    				"Mind Blank",
    				"Polymorph Any Object",
    				"Monster Summoning VI"
    			],
    			[
    				"Meteor Swarm",
    				"Shape Change",
    				"Time Stop",
    				"Power Word-Kill",
    				"Gate",
    				"Wish",
    				"Astral Spell",
    				"Prismatic Wall",
    				"Maze",
    				"Monster Summoning VII"
    			]
    		],
    		levels: [
    			{
    				level: 1,
    				hitDice: "1d4",
    				experience: 0,
    				maxSpellLevel: 1
    			},
    			{
    				level: 2,
    				hitDice: "2d4",
    				experience: 2400,
    				maxSpellLevel: 1
    			},
    			{
    				level: 3,
    				hitDice: "3d4",
    				experience: 4800,
    				maxSpellLevel: 2
    			},
    			{
    				level: 4,
    				hitDice: "4d4",
    				experience: 9600,
    				maxSpellLevel: 2
    			},
    			{
    				level: 5,
    				hitDice: "5d4",
    				experience: 19200,
    				maxSpellLevel: 3
    			},
    			{
    				level: 6,
    				hitDice: "6d4",
    				experience: 38500,
    				maxSpellLevel: 3
    			},
    			{
    				level: 7,
    				hitDice: "7d4",
    				experience: 84000,
    				maxSpellLevel: 4
    			},
    			{
    				level: 8,
    				hitDice: "8d4",
    				experience: 180000,
    				maxSpellLevel: 4
    			},
    			{
    				level: 9,
    				hitDice: "9d4",
    				experience: 300000,
    				maxSpellLevel: 5
    			},
    			{
    				level: 10,
    				hitDice: "9d4",
    				experience: 600000,
    				maxSpellLevel: 5
    			},
    			{
    				level: 11,
    				hitDice: "9d4+1",
    				experience: 820000,
    				maxSpellLevel: 5
    			},
    			{
    				level: 12,
    				hitDice: "9d4+1",
    				experience: 1040000,
    				maxSpellLevel: 6
    			},
    			{
    				level: 13,
    				hitDice: "9d4+2",
    				experience: 1260000,
    				maxSpellLevel: 6
    			},
    			{
    				level: 14,
    				hitDice: "9d4+2",
    				experience: 1480000,
    				maxSpellLevel: 7
    			},
    			{
    				level: 15,
    				hitDice: "9d4+3",
    				experience: 1700000,
    				maxSpellLevel: 7
    			},
    			{
    				level: 16,
    				hitDice: "9d4+3",
    				experience: 1920000,
    				maxSpellLevel: 8
    			},
    			{
    				level: 17,
    				hitDice: "9d4+4",
    				experience: 2140000,
    				maxSpellLevel: 8
    			},
    			{
    				level: 18,
    				hitDice: "9d4+4",
    				experience: 2360000,
    				maxSpellLevel: 9
    			},
    			{
    				level: 19,
    				hitDice: "9d4+5",
    				experience: 2580000,
    				maxSpellLevel: 9
    			},
    			{
    				level: 20,
    				hitDice: "9d4+5",
    				experience: 2800000,
    				maxSpellLevel: 9
    			},
    			{
    				level: 21,
    				hitDice: "9d4+6",
    				experience: 3020000,
    				maxSpellLevel: 9
    			},
    			{
    				level: 22,
    				hitDice: "9d4+6",
    				experience: 3240000,
    				maxSpellLevel: 9
    			}
    		]
    	}
    };
    var ifData = {
    	abilities: abilities,
    	classes: classes
    };

    const resetSpellBook = (spellBook) => {
        //console.log('resetSpellBook called')
        spellBook = utils.deepClone(ifData.classes.magicUser.startingSpellBook);
    };

    const generateSpellBook = (selectedLevel, selectedIntelligence, spellBook) => {
        
        // Reset the spellbook
        resetSpellBook(spellBook);
        console.log('generateSpellBook, selectedIntelligence:', selectedIntelligence);

        // Go through each class level up to the "maxSpellLevel", which is the highgest memorizable spell level.
        for (let i = 0; i < selectedLevel.maxSpellLevel; i++) {

            //console.log('Generating spells for level:', i+1)
            
            let currentSpells = spellBook[i].spells;
            let spellsAvailable = utils.deepClone(ifData.classes.magicUser.spells[i]);

            if (i == 0) {
                // FIXME Read Magic is already in the list... so filter it out for generation.
                spellsAvailable = spellsAvailable.filter(item => item !== "Read Magic");
            }

            //console.log('currentSpells:', currentSpells)
            //console.log('spellsAvailable:', spellsAvailable)

            let moreSpells = true;
            while (moreSpells) {
                // 0) Did we run out of spellsAvailable for this level?
                if (spellsAvailable.length === 0) {
                    moreSpells = false;
                    continue
                }
                
                // 1) Too many spells already?
                if (currentSpells.length >= selectedIntelligence.maxNum) {
                    moreSpells = false;
                    continue
                }
                
                // 2) Too few spells? Add a new one immediately.
                if (currentSpells.length < selectedIntelligence.minNum) {
                    let newSpell = getUniqueSpell(currentSpells, spellsAvailable);
                    currentSpells.push(newSpell);
                    // Remove this spell from the list
                    spellsAvailable = spellsAvailable.filter(item => item !== newSpell);
                    moreSpells = true;
                    continue
                }
                
                // 3) Inbetween min and max? Roll to add another spell
                // TODO Confirm this logic with IF - random or sequential?
                // i.e. "stopping when all have been checked or the Max # number has been reached"
                let newSpell = getUniqueSpell(currentSpells, spellsAvailable);
                if (utils.roll1d100() <= selectedIntelligence.spellChance) {
                    currentSpells.push(newSpell);
                }
                // Remove this item regardless of spellChance, as per IF p.134
                spellsAvailable = spellsAvailable.filter(item => item !== newSpell);
                moreSpells = true;
                continue
            }
        }

    };

    const getUniqueSpell = (currentSpells, spellsAvailable) => {
        let keepGoing = true;
        while (keepGoing) {
            let newSpell = utils.randomArrayItem(spellsAvailable);
            if (!currentSpells.includes(newSpell)) {
                keepGoing = false;
                return newSpell
            }
        }
    };

    // TODO Move to utils module?



    var spellBook = {
        resetSpellBook,
        generateSpellBook
    };

    /* src\components\App.svelte generated by Svelte v3.29.0 */
    const file = "src\\components\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (31:6) {#each ifData.classes.magicUser.levels as option}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[11].level + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[11];
    			option.value = option.__value;
    			add_location(option, file, 31, 7, 784);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ifData*/ 2 && t_value !== (t_value = /*option*/ ctx[11].level + "")) set_data_dev(t, t_value);

    			if (dirty & /*ifData*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[11])) {
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(31:6) {#each ifData.classes.magicUser.levels as option}",
    		ctx
    	});

    	return block;
    }

    // (43:7) {:else}
    function create_else_block(ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[11].levelMin + "";
    	let t0;
    	let t1;
    	let t2_value = /*option*/ ctx[11].levelMax + "";
    	let t2;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text("-");
    			t2 = text(t2_value);
    			option.__value = option_value_value = /*option*/ ctx[11];
    			option.value = option.__value;
    			add_location(option, file, 43, 8, 1137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ifData*/ 2 && t0_value !== (t0_value = /*option*/ ctx[11].levelMin + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*ifData*/ 2 && t2_value !== (t2_value = /*option*/ ctx[11].levelMax + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*ifData*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[11])) {
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
    		source: "(43:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:7) {#if option.levelMin === option.levelMax}
    function create_if_block_1(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[11].levelMax + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[11];
    			option.value = option.__value;
    			add_location(option, file, 41, 8, 1064);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ifData*/ 2 && t_value !== (t_value = /*option*/ ctx[11].levelMax + "")) set_data_dev(t, t_value);

    			if (dirty & /*ifData*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[11])) {
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
    		source: "(41:7) {#if option.levelMin === option.levelMax}",
    		ctx
    	});

    	return block;
    }

    // (40:6) {#each ifData.abilities.intelligence as option}
    function create_each_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[11].levelMin === /*option*/ ctx[11].levelMax) return create_if_block_1;
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(40:6) {#each ifData.abilities.intelligence as option}",
    		ctx
    	});

    	return block;
    }

    // (66:5) {#if spellBookLevel.spells.length > 0}
    function create_if_block(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*spellBookLevel*/ ctx[8].level + "";
    	let t1;
    	let t2;
    	let t3_value = /*spellBookLevel*/ ctx[8].spells.join(", ") + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Level ");
    			t1 = text(t1_value);
    			t2 = text(": ");
    			t3 = text(t3_value);
    			add_location(div, file, 66, 5, 1921);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userSpellBook*/ 16 && t1_value !== (t1_value = /*spellBookLevel*/ ctx[8].level + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*userSpellBook*/ 16 && t3_value !== (t3_value = /*spellBookLevel*/ ctx[8].spells.join(", ") + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(66:5) {#if spellBookLevel.spells.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#each userSpellBook as spellBookLevel}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*spellBookLevel*/ ctx[8].spells.length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*spellBookLevel*/ ctx[8].spells.length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(65:4) {#each userSpellBook as spellBookLevel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let div3;
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
    	let fieldset0;
    	let legend0;
    	let t7;
    	let div0;
    	let t8;
    	let select0;
    	let t9;
    	let div2;
    	let t10;
    	let select1;
    	let t11;
    	let div1;
    	let small0;
    	let t12;
    	let t13_value = /*selectedLevel*/ ctx[2].level + "";
    	let t13;
    	let t14;
    	let t15_value = /*selectedLevel*/ ctx[2].experience + "";
    	let t15;
    	let t16;
    	let t17_value = /*selectedIntelligence*/ ctx[3].spellChance + "";
    	let t17;
    	let t18;
    	let t19_value = /*selectedIntelligence*/ ctx[3].minNum + "";
    	let t19;
    	let t20;
    	let t21_value = /*selectedIntelligence*/ ctx[3].maxNum + "";
    	let t21;
    	let t22;
    	let t23_value = /*selectedIntelligence*/ ctx[3].maxLevel + "";
    	let t23;
    	let t24;
    	let t25;
    	let button;
    	let t27;
    	let fieldset1;
    	let legend1;
    	let t28;
    	let t29_value = /*selectedLevel*/ ctx[2].level + "";
    	let t29;
    	let t30;
    	let t31;
    	let t32;
    	let footer;
    	let small1;
    	let t33;
    	let a;
    	let t34;
    	let a_href_value;
    	let t35;
    	let t36_value = /*appData*/ ctx[0].version + "";
    	let t36;
    	let t37;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*ifData*/ ctx[1].classes.magicUser.levels;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*ifData*/ ctx[1].abilities.intelligence;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*userSpellBook*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
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
    			t5 = space();
    			fieldset0 = element("fieldset");
    			legend0 = element("legend");
    			legend0.textContent = "Configure";
    			t7 = space();
    			div0 = element("div");
    			t8 = text("Character Level:\n\t\t\t\t\t");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t9 = space();
    			div2 = element("div");
    			t10 = text("Intelligence:\n\t\t\t\t\t");
    			select1 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t11 = space();
    			div1 = element("div");
    			small0 = element("small");
    			t12 = text("Level=");
    			t13 = text(t13_value);
    			t14 = text(", \n\t\t\t\t\t\tExperience=");
    			t15 = text(t15_value);
    			t16 = text(", \n\t\t\t\t\t\tChance=");
    			t17 = text(t17_value);
    			t18 = text("%, \n\t\t\t\t\t\tMin=");
    			t19 = text(t19_value);
    			t20 = text(", \n\t\t\t\t\t\tMax=");
    			t21 = text(t21_value);
    			t22 = text(", \n\t\t\t\t\t\tMaxLevel=");
    			t23 = text(t23_value);
    			t24 = text(".");
    			t25 = space();
    			button = element("button");
    			button.textContent = "Generate Spellbook";
    			t27 = space();
    			fieldset1 = element("fieldset");
    			legend1 = element("legend");
    			t28 = text("Level ");
    			t29 = text(t29_value);
    			t30 = text(" Magic-User's Spellbook");
    			t31 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t32 = space();
    			footer = element("footer");
    			small1 = element("small");
    			t33 = text("Text used is © 2014-2016 Chris Gonnerman. For code, see the ");
    			a = element("a");
    			t34 = text("github repo");
    			t35 = text(". Last deployed ");
    			t36 = text(t36_value);
    			t37 = text(".");
    			attr_dev(h1, "class", "svelte-1d16ed0");
    			add_location(h1, file, 18, 3, 410);
    			add_location(p, file, 19, 3, 438);
    			add_location(header, file, 17, 2, 398);
    			add_location(h2, file, 23, 3, 521);
    			add_location(legend0, file, 26, 4, 569);
    			if (/*selectedLevel*/ ctx[2] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[5].call(select0));
    			add_location(select0, file, 29, 5, 633);
    			add_location(div0, file, 27, 4, 600);
    			if (/*selectedIntelligence*/ ctx[3] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[6].call(select1));
    			add_location(select1, file, 38, 5, 910);
    			add_location(small0, file, 48, 10, 1263);
    			add_location(div1, file, 48, 5, 1258);
    			add_location(div2, file, 36, 4, 880);
    			add_location(fieldset0, file, 25, 3, 554);
    			add_location(button, file, 60, 3, 1592);
    			add_location(legend1, file, 63, 4, 1760);
    			add_location(fieldset1, file, 62, 3, 1745);
    			attr_dev(main, "class", "svelte-1d16ed0");
    			add_location(main, file, 22, 2, 511);
    			attr_dev(a, "href", a_href_value = /*appData*/ ctx[0].ghRepo);
    			add_location(a, file, 74, 75, 2133);
    			add_location(small1, file, 74, 3, 2061);
    			attr_dev(footer, "class", "svelte-1d16ed0");
    			add_location(footer, file, 73, 2, 2049);
    			attr_dev(div3, "class", "item svelte-1d16ed0");
    			add_location(div3, file, 15, 1, 376);
    			attr_dev(div4, "class", "container svelte-1d16ed0");
    			add_location(div4, file, 13, 0, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, header);
    			append_dev(header, h1);
    			append_dev(h1, t0);
    			append_dev(header, t1);
    			append_dev(header, p);
    			append_dev(div3, t3);
    			append_dev(div3, main);
    			append_dev(main, h2);
    			append_dev(main, t5);
    			append_dev(main, fieldset0);
    			append_dev(fieldset0, legend0);
    			append_dev(fieldset0, t7);
    			append_dev(fieldset0, div0);
    			append_dev(div0, t8);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			select_option(select0, /*selectedLevel*/ ctx[2]);
    			append_dev(fieldset0, t9);
    			append_dev(fieldset0, div2);
    			append_dev(div2, t10);
    			append_dev(div2, select1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select1, null);
    			}

    			select_option(select1, /*selectedIntelligence*/ ctx[3]);
    			append_dev(div2, t11);
    			append_dev(div2, div1);
    			append_dev(div1, small0);
    			append_dev(small0, t12);
    			append_dev(small0, t13);
    			append_dev(small0, t14);
    			append_dev(small0, t15);
    			append_dev(small0, t16);
    			append_dev(small0, t17);
    			append_dev(small0, t18);
    			append_dev(small0, t19);
    			append_dev(small0, t20);
    			append_dev(small0, t21);
    			append_dev(small0, t22);
    			append_dev(small0, t23);
    			append_dev(small0, t24);
    			append_dev(main, t25);
    			append_dev(main, button);
    			append_dev(main, t27);
    			append_dev(main, fieldset1);
    			append_dev(fieldset1, legend1);
    			append_dev(legend1, t28);
    			append_dev(legend1, t29);
    			append_dev(legend1, t30);
    			append_dev(fieldset1, t31);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(fieldset1, null);
    			}

    			append_dev(div3, t32);
    			append_dev(div3, footer);
    			append_dev(footer, small1);
    			append_dev(small1, t33);
    			append_dev(small1, a);
    			append_dev(a, t34);
    			append_dev(small1, t35);
    			append_dev(small1, t36);
    			append_dev(small1, t37);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[5]),
    					listen_dev(
    						select0,
    						"change",
    						function () {
    							if (is_function(spellBook.resetSpellBook(/*userSpellBook*/ ctx[4]))) spellBook.resetSpellBook(/*userSpellBook*/ ctx[4]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[6]),
    					listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*appData*/ 1 && t0_value !== (t0_value = /*appData*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*ifData*/ 2) {
    				each_value_2 = /*ifData*/ ctx[1].classes.magicUser.levels;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*selectedLevel, ifData*/ 6) {
    				select_option(select0, /*selectedLevel*/ ctx[2]);
    			}

    			if (dirty & /*ifData*/ 2) {
    				each_value_1 = /*ifData*/ ctx[1].abilities.intelligence;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selectedIntelligence, ifData*/ 10) {
    				select_option(select1, /*selectedIntelligence*/ ctx[3]);
    			}

    			if (dirty & /*selectedLevel*/ 4 && t13_value !== (t13_value = /*selectedLevel*/ ctx[2].level + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*selectedLevel*/ 4 && t15_value !== (t15_value = /*selectedLevel*/ ctx[2].experience + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*selectedIntelligence*/ 8 && t17_value !== (t17_value = /*selectedIntelligence*/ ctx[3].spellChance + "")) set_data_dev(t17, t17_value);
    			if (dirty & /*selectedIntelligence*/ 8 && t19_value !== (t19_value = /*selectedIntelligence*/ ctx[3].minNum + "")) set_data_dev(t19, t19_value);
    			if (dirty & /*selectedIntelligence*/ 8 && t21_value !== (t21_value = /*selectedIntelligence*/ ctx[3].maxNum + "")) set_data_dev(t21, t21_value);
    			if (dirty & /*selectedIntelligence*/ 8 && t23_value !== (t23_value = /*selectedIntelligence*/ ctx[3].maxLevel + "")) set_data_dev(t23, t23_value);
    			if (dirty & /*selectedLevel*/ 4 && t29_value !== (t29_value = /*selectedLevel*/ ctx[2].level + "")) set_data_dev(t29, t29_value);

    			if (dirty & /*userSpellBook*/ 16) {
    				each_value = /*userSpellBook*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(fieldset1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*appData*/ 1 && a_href_value !== (a_href_value = /*appData*/ ctx[0].ghRepo)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*appData*/ 1 && t36_value !== (t36_value = /*appData*/ ctx[0].version + "")) set_data_dev(t36, t36_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	let selectedLevel = ifData.classes.magicUser.levels[0];
    	let selectedIntelligence = ifData.abilities.intelligence[4];
    	let userSpellBook = utils.deepClone(ifData.classes.magicUser.startingSpellBook);
    	const writable_props = ["appData", "ifData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		selectedLevel = select_value(this);
    		$$invalidate(2, selectedLevel);
    		$$invalidate(1, ifData);
    	}

    	function select1_change_handler() {
    		selectedIntelligence = select_value(this);
    		$$invalidate(3, selectedIntelligence);
    		$$invalidate(1, ifData);
    	}

    	const click_handler = () => $$invalidate(4, userSpellBook = spellBook.generateSpellBook(selectedLevel, selectedIntelligence, userSpellBook));

    	$$self.$$set = $$props => {
    		if ("appData" in $$props) $$invalidate(0, appData = $$props.appData);
    		if ("ifData" in $$props) $$invalidate(1, ifData = $$props.ifData);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		spellBook,
    		appData,
    		ifData,
    		selectedLevel,
    		selectedIntelligence,
    		userSpellBook
    	});

    	$$self.$inject_state = $$props => {
    		if ("appData" in $$props) $$invalidate(0, appData = $$props.appData);
    		if ("ifData" in $$props) $$invalidate(1, ifData = $$props.ifData);
    		if ("selectedLevel" in $$props) $$invalidate(2, selectedLevel = $$props.selectedLevel);
    		if ("selectedIntelligence" in $$props) $$invalidate(3, selectedIntelligence = $$props.selectedIntelligence);
    		if ("userSpellBook" in $$props) $$invalidate(4, userSpellBook = $$props.userSpellBook);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		appData,
    		ifData,
    		selectedLevel,
    		selectedIntelligence,
    		userSpellBook,
    		select0_change_handler,
    		select1_change_handler,
    		click_handler
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
    			console.warn("<App> was created without expected prop 'appData'");
    		}

    		if (/*ifData*/ ctx[1] === undefined && !("ifData" in props)) {
    			console.warn("<App> was created without expected prop 'ifData'");
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
    var version = "08 Oct 2020 14:58:00";
    var ghRepo = "https://github.com/ScottMaclure/oddtools";
    var appData = {
    	title: title,
    	version: version,
    	ghRepo: ghRepo
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
