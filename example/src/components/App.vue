<template>
    <article>
        <h1>
            <router-link to="/">Root.vue</router-link>
            <router-link to="/a">A</router-link>
            <router-link to="/b">B</router-link>
            <router-link to="/c">C</router-link>
            <router-link to="/d">D</router-link>
            <router-link to="/e">E</router-link>
        </h1>

        <div>
            <router-view />
        </div>
    </article>
</template>

<style lang="scss">
*{
    font-family: 'Courier New', Courier, monospace;
    margin: 0;
    padding: 0;
}

a{
    display: inline-block;
    padding: 20px;
}

article{
    background: rgba(0, 0, 0, 10%);
    box-sizing: border-box;
    padding: 40px;
    width: 100%;

    > div{
        display: flex;
    }
}
</style>
