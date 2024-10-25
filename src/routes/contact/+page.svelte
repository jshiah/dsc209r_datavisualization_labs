<svelte:head>
    <title>Contact</title>
</svelte:head>


<h1>Contact</h1>

<form action="mailto:TesterUser@ucsd.edu" method="GET">
    <label for="subject">Subject:</label>
    <input type="text" name="subject" id="subject" required>

    <label for="body">Message:</label>
    <textarea name="body" id="body" required></textarea>

    <button>Send</button>
</form>