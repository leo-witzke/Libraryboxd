<script>
	import Dropdown from '../components/Dropdown.svelte';

	import { library, setLibrary, branch, setBranch } from '$lib/manage-cookies.ts';
	import { getLibraryList } from '$lib/get-and-parse.ts';

	let library_;
	library.subscribe((value) => {
		library_ = value;
	});

	let libraries = getLibraryList();

	const a = new Map();
	a.set("a",1);

	const b = new Map();
	b.set("b","fghjhgfghjhgfghjhgfdfghjhgfdfghjhgfdfghgfdfghgfdfghgfdfghgfdfghgfghjhgfghgf");

</script>

<style>
	:root {
        --hoverColorLight: #8B98A8;
        --hoverColorDark: #737F8E;
        --textNormal: #95A2B2;
        --textDropdown: #364351;
        --textHover: #FFFFFF;
		--textSelected: #1DDF43;
	}

	p, div {
		color: var(--textNormal);
	}

	.description {
		text-align: center;
		margin: 0;
	}

	.top-bar {
		color: #FFFFFF;
		text-align: center;
		background-color: #15181C;
		padding: 7px;
		margin: 0 0;
	}
</style>

<p class="top-bar">
	<b>Letterboxd Library Integration</b>
</p>
<div style="margin: 3px">
	<Dropdown entries={a} title="LIBRARY"/>
	<Dropdown entries={b} title="LIBRARY"/>
	{#await libraries}
		Loading Libraries List
	{:then librariesMap}
		<Dropdown entries={librariesMap} title="LIBRARY" callback={setLibrary}/>
	{/await}
</div>
<hr style="width: 100%; border: 1px solid var(--spacer);"/>
<p class="description">
	Searching the {library_}
</p>