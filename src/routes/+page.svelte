<script>
	import Dropdown from '../components/Dropdown.svelte';
	import { getLibraryList } from '$lib/get-and-parse.ts';
	let librariesPromise = getLibraryList();

	// import { setBranch } from '$lib/manage-cookies.ts';
	// // setBranch("austin")
</script>

<style>
	:root {
        --hoverColorLight: #8B98A8;
        --hoverColorDark: #737F8E;
        --textNormal: #95A2B2;
        --textDropdown: #364351;
        --textHover: #FFFFFF;
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
<div style="margin: 3px;">
	<Dropdown/>
	{#await librariesPromise}
		Loading Libraries List
	{:then libraries}
		<Dropdown entries={libraries}/>
	{/await}
</div>
<hr style="width: 100%; border: 1px solid var(--spacer);"/>
<p class="description">
	Searching the ___(library)
</p>