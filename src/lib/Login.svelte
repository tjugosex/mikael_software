<script lang="ts">
  import { currentUser, pb } from "./pocketbase";
  import PixelField from "./PixelField.svelte";
  import UserList from "./UserList.svelte";
  import "../routes/pixelgame/app.css";
  let username: string;
  let password: string;
  let errorstring = "";
  let anhourago = new Date(Date.now() - 1000 * 60 * 60);
  async function login() {
    errorstring = "";
    try {
      await pb.collection("users").authWithPassword(username, password);
    } catch {
      errorstring = "Wrong password or user doesnt exist";
    }
  }

  async function signUp() {
    errorstring = "";
    try {
      const data = {
        username,
        password,
        passwordConfirm: password,
        name: username,
        gavepoints: anhourago,
      };
      console.log(anhourago);
      const createdUser = await pb.collection("users").create(data);
      await login();
    } catch (err) {
      console.error(err);
      errorstring = "User already exists or password was too short";
    }
  }

  function signOut() {
    pb.authStore.clear();
    window.location.reload();
  }
</script>

<main>
  {#if $currentUser}
    <div>
      <PixelField />
      <UserList />
      <p class="signedin">Signed in as {$currentUser.username}</p>
      <button class="loginbuttons"style="color:white" on:click={signOut}>Sign out</button>
    </div>
  {/if}

  {#if !$currentUser}
    <h1>Pixel</h1>
    <form on:submit|preventDefault>
      <input placeholder="Username" type="text" bind:value={username} />
      <input
        placeholder="Password (characters >= 8)"
        type="password"
        bind:value={password}
      />
      <button class="loginbuttons"style="color:white" on:click={signUp}>Sign Up</button>
      <button class="loginbuttons"style="color:white" on:click={login}>Login</button>
    </form>
    {errorstring}
  {/if}
</main>

<style>
  
  main {
    margin-left: 50px;
  }
</style>
