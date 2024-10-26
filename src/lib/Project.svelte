<!-- <script>
    export let data = {}; // Project data
    export let hLevel = 2; // Default heading level
</script>

<article>
    <svelte:element this={'h' + hLevel}>{data.title}</svelte:element>
    <img src={data.image} alt="" />
    <p>{data.description}</p>
</article> -->

<script>
    export let data = {}; // Project data
    export let hLevel = 2; // Default heading level
</script>

<article>
    <svelte:element this={'h' + hLevel}>{data.title}</svelte:element>
    <img src={data.image} alt="" />
    <p>{data.description}</p>
</article>

<style>
    h2, h3 {
        margin: 0; /* Remove excessive margin from headings */
    }
</style>