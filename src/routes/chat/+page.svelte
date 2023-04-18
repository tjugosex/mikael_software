<script lang="ts">
  import { currentUser, pb } from "../../lib/pocketbase";
  import Chat from "../../lib/Chat.svelte";
  import { onMount } from "svelte";

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
  onMount(() => {});
</script>

<main>
  {#if $currentUser}
    <div>
      <Chat />

      <p class="signedin">Signed in as {$currentUser.username}</p>
      <button class="button-80"style="color:black" on:click={signOut}>Sign out</button>
    </div>
  {/if}

  {#if !$currentUser}
    <h1>Chat</h1>
    <form on:submit|preventDefault>
      <input placeholder="Username" type="text" bind:value={username} />
      <input
        placeholder="Password (characters >= 8)"
        type="password"
        bind:value={password}
      />
      <button class="button-80"style="color:black" on:click={signUp}>Sign Up</button>
      <button class="button-80"style="color:black" on:click={login}>Login</button>
    </form>
    {errorstring}
  {/if}
</main>

<style>
  :root {
    background-color: rgb(235, 235, 235);

    color: rgb(0, 0, 0);
  }
  main {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
    width: 400px;
    margin: 1px;
    color: rgb(0, 0, 0);
    background-color: rgb(235, 235, 235);
    border: thin solid;
    border-radius: 3px;
    padding: 5px;
  }
  .signedin {
    background-color: rgb(224, 224, 224);
    width: fit-content;
    padding: 5px;
    border-radius: 3px;
    color: rgb(0, 0, 0);
  }
  



/* CSS */
.button-80 {
  margin: 3px;
  background: #fff;
  backface-visibility: hidden;
  border-radius: .375rem;
  border-style: solid;
  border-width: .125rem;
  box-sizing: border-box;
  color: #212121;
  cursor: pointer;
  display: inline-block;
  font-family: Circular,Helvetica,sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -.01em;
  line-height: 1.3;
  padding: .875rem 1.125rem;
  position: relative;
  text-align: left;
  text-decoration: none;
  transform: translateZ(0) scale(1);
  transition: transform .2s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-80:not(:disabled):hover {
  transform: scale(1.05);
}

.button-80:not(:disabled):hover:active {
  transform: scale(1.05) translateY(.125rem);
}

.button-80:focus {
  outline: 0 solid transparent;
}

.button-80:focus:before {
  content: "";
  left: calc(-1*.375rem);
  pointer-events: none;
  position: absolute;
  top: calc(-1*.375rem);
  transition: border-radius;
  user-select: none;
}

.button-80:focus:not(:focus-visible) {
  outline: 0 solid transparent;
}

.button-80:focus:not(:focus-visible):before {
  border-width: 0;
}

.button-80:not(:disabled):active {
  transform: translateY(.125rem);
}
</style>
