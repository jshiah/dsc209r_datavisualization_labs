<script>
    export let data = {}; // Project data
    export let hLevel = 2; // Default heading level

    import Pie from '$lib/Pie.svelte';
</script>

<article>
    <svelte:element this={'h' + hLevel}>{data.title}</svelte:element>
    <p>{data.year}
    <img src={data.image} alt="" />
    <p>{data.description}</p>

    <!-- Use the Pie component here -->
    <!-- <Pie />  -->
    <Pie data={data.pieData} />

</article> 

<style>
    h2, h3 {
        margin: 0; 
    }
</style>