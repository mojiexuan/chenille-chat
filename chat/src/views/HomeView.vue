<template>
    <div class="home">
        <div class="home-nav">
        </div>
        <div class="home-content"></div>
    </div>
</template>

<script setup lang="ts" name="home">
</script>

<style scoped>
.home {
    width: 100vw;
    height: 100vh;
    background: var(--ch-feature-card-bg);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 6px;
    overflow: hidden;
}

.home-nav {
    width: 254px;
    height: calc(100vh - 12px);
    overflow: hidden;
    position: fixed;
    transform: translateX(-100%);
    transition: all .3s ease;
}

@media screen and (min-width: 768px) {
    .home-nav {
        position: unset;
        transform: translateX(0);
    }
}

.home-content {
    flex: 1;
    height: 100%;
    background: var(--ch-bg-color-card);
    border-radius: 8px;
    overflow: hidden;
    transition: all .3s ease;
}
</style>