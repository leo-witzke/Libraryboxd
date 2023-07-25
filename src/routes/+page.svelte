<script lang="ts">
	import Dropdown from '../components/Dropdown.svelte';

	import { library, setLibrary, branch, setBranch } from '$lib/manage-cookies.ts';
	import { getLibraryList, getBranches } from '$lib/get-and-parse.ts';

	let library_;
	library.subscribe((value) => {
		library_ = value;
	});

	let branch_;
	branch.subscribe((value) => {
		branch_ = value;
	});

	let libraries = getLibraryList();
	let branches = getBranches();
	$: library_, branches = getBranches();

	function mapGetWithDefault(map: Map<string, string>, key: string, def: string) {
		return map.get(key) ?? def
	}
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
<div style="margin: 3px; white-space: nowrap;">
	{#await libraries}
		Loading Libraries List
	{:then librariesMap}
		<Dropdown entries={librariesMap} title="LIBRARY" callback={setLibrary} store={library}/>
	{/await}
	{#await branches then branchesMap}
		<Dropdown entries={branchesMap} title="BRANCH" callback={setBranch} store={branch}/>
	{/await}
</div>
<hr style="width: 100%; border: 1px solid var(--spacer);"/>
<p style="margin: 5px" class="description">
	{#if library_ == undefined || library_ == ""}
		Select a library
	{:else}
		{#await libraries}
			Loading Libraries
		{:then librariesMap}
			{#if branch_ == undefined || branch_ == ""}
				Select a branch in the {mapGetWithDefault(librariesMap, library_, library_)}
			{:else}
				{#await branches}
					Loading Branches
				{:then branchesMap}
					Searching the {mapGetWithDefault(branchesMap, branch_, branch_)} of {mapGetWithDefault(librariesMap, library_, library_)}
				{/await}
			{/if}
		{/await}
	{/if}
</p>