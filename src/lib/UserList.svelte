<script lang="ts">
  import { currentUser, pb } from "./pocketbase";
  import { onMount } from "svelte";
  let usersList = [];

  async function fetchUsers() {
    try {
      const records = await pb.collection("users").getFullList({
        sort: "-points",
      });

      usersList = records.map((user) => ({
        username: user.username,
        points: user.points || 0,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function getCountdown() {
    // Get the current user's record
    const userRecord = await pb.collection("users").getOne($currentUser.id);
    const gavePointsDate = new Date(userRecord.gavepoints);
    const nextAllowedTime = new Date(gavePointsDate.getTime() + 1000  * 60); // Add 1 hour to the gavePointsDate

    const currentTime = new Date();
    let timeDifference = nextAllowedTime.getTime() - currentTime.getTime();

    if (timeDifference <= 0) {
      return "00:00:00";
    } else {
      let hours = Math.floor(timeDifference / (1000 * 60 * 60));
      timeDifference %= 1000 * 60 * 60;
      let minutes = Math.floor(timeDifference / (1000 * 60));
      timeDifference %= 1000 * 60;
      let seconds = Math.floor(timeDifference / 1000);

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
  }
  let countdown = "";
  async function updateCountdown() {
    countdown = await getCountdown();
  }

  let interval: NodeJS.Timeout;

  onMount(() => {
    // Add this line to fetch users when the component is mounted
    fetchUsers();
    interval = setInterval(fetchUsers, 5000);
    updateCountdown;
    interval = setInterval(updateCountdown, 1000);
  });
</script>

{#if countdown != "00:00:00"}
  <h1>Time until you can vote again: {countdown}</h1>
{/if}
{#if countdown == "00:00:00"}
  <h1>Point button ready!</h1>
{/if}
<div class="users-list">
  <h3>Users and Points</h3>
  <ul class="users-list-ul">
    {#each usersList as user}
      <li class="users-list-li">{user.username}: {user.points} points</li>
    {/each}
  </ul>
</div>
