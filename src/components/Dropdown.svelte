<script lang="ts">
    import { onMount } from 'svelte';

	export let entries: Map<string, string>;

    export let callback = (entry: string) => {console.log(entry)};

    export let title: string;

    let previouslySelected;
    export let store = null;
    onMount(() => {
        store?.subscribe((value) => {
            const clickedButton = document.getElementById(value);
            if (clickedButton != undefined) {
                previouslySelected?.style.removeProperty("color");
                clickedButton.style.color = "var(--textSelected)";
                previouslySelected = clickedButton;
            }
        });
    });
</script>

<style>
    :root {
        --spacer: #7D8997;
        --entry-padding: 3px 6px 3px 8px;
    }

    .dropdown {
        color: var(--textNormal);
        display: inline-block;
        padding: 5px 0 5px 0;
        border-radius: 5px;
    }

    .dropdown:hover {
        color: var(--textDropdown);
        background-color: var(--hoverColorLight);
    }

    .dropdown:hover .dropdown-content {
        display: grid;
    }

    .dropdown-content {
        display: none;
        position: relative;
        background-color: var(--hoverColorLight);
    }

    .dropdown-content button {
        color: var(--textDropdown);
        padding: var(--entry-padding);
        font-family: Graphik-Regular-Web,sans-serif;
    }

    .dropdown-content button:hover {
        color: var(--textHover);
        background-color: var(--hoverColorDark);
    }

    .spacer {
        width: 98%;
        margin: 3px 0;
        border: 1px solid var(--spacer);
    }

    button {
        text-align: left;
        background-color: transparent;
        border: none;
    }

</style>

<div class="dropdown">
    <div style="padding: var(--entry-padding);">{title} <div style="display: inline; font-size: 0.75em;">▼</div></div>
    <div class="dropdown-content">
        <hr class="spacer">
        {#each [...entries] as [key, entry]}
            <button id={key} on:click={() => {callback(key)}}>{entry+" ("+key+")"}</button>
        {/each}
    </div>
</div>