<script>
	export let entries = new Map();
    // entries.set('a', 1);

    export const title = "BRANCH";

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

    .dropdown-content div {
        color: var(--textDropdown);
        padding: var(--entry-padding);
        font-family: Graphik-Regular-Web,sans-serif;
    }

    .dropdown-content div:hover {
        color: var(--textHover);
        background-color: var(--hoverColorDark);
    }

    .spacer {
        width: 98%;
        margin: 3px 0;
        border: 1px solid var(--spacer);
    }

</style>

<div class="dropdown">
    <div style="padding: var(--entry-padding);">{title} <div style="display: inline; font-size: 0.75em;">▼</div></div>
    <div class="dropdown-content">
        <hr class="spacer">
        {#each [...entries] as [key, entry]}
            <div>{key}</div>
        {/each}
    </div>
</div>