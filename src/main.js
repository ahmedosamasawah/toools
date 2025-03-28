import './css/base.css'
import './css/tailwind.css'

import {mount} from 'svelte'

import {load_custom_prompts} from '$lib/stores/prompts.js'

import App from './App.svelte'

load_custom_prompts()

mount(App, {target: document.body})
