<script setup lang="ts">
import { ref } from 'vue'

const style = ref('')
</script>

<template>
  <div :class="['menu-btn', style]" @click="style = style ? '' : 'top'">
    <div></div>
  </div>
</template>

<style lang="less">
@size: 36px;
@icon-color: #f00;
@background: #fff;

.dummy {
  content: '';
  display: block;
  position: relative;
  height: @size * 0.1;
  width: @size * 0.8;
  background: @icon-color;
  transition: 0.6s;
}

.menu-btn {
  width: @size;
  height: @size;
  background: @background;
  cursor: pointer;
  transition: 0.6s;

  div {
    position: relative;
    left: @size * 0.1;
    top: @size * 0.45;
    height: @size * 0.1;
    width: @size * 0.8;
    background: @icon-color;
    transition: 0.6s;

    &:before {
      .dummy;
      top: @size * -0.25;
    }

    &:after {
      .dummy;
      top: @size * 0.15;
    }
  }

  &.close div {
    background: transparent;

    &::before {
      transform: translateY(@size * 0.24) rotateZ(225deg) scaleX(1.2);
    }

    &::after {
      transform: translateY(@size * -0.24) rotateZ(-225deg) scaleX(1.2);
    }
  }

  &.left div {
    transform: rotateZ(180deg);

    &::before {
      transform: translate(@size * 0.19, @size * 0.07) rotateZ(45deg) scaleX(0.6);
    }

    &::after {
      transform: translate(@size * 0.19, @size * -0.07) rotateZ(-45deg) scaleX(0.6);
    }
  }

  &.top div {
    transform: rotateZ(270deg);

    &::before {
      transform: translate(@size * 0.19, @size * 0.07) rotateZ(45deg) scaleX(0.6);
    }

    &::after {
      transform: translate(@size * 0.19, @size * -0.07) rotateZ(-45deg) scaleX(0.6);
    }
  }

  &.right div {
    transform: rotateZ(360deg);

    &::before {
      transform: translate(@size * 0.19, @size * 0.07) rotateZ(45deg) scaleX(0.6);
    }

    &::after {
      transform: translate(@size * 0.19, @size * -0.07) rotateZ(-45deg) scaleX(0.6);
    }
  }
}
</style>
