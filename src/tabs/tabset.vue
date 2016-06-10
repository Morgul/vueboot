<template>
    <div class="tabset clearfix" :class="orientationClass()">
        <!-- Nav tabs -->
        <ul v-if="orientation != 'bottom' && orientation != 'right'" class="nav nav-tabs" role="tablist">
            <li class="nav-item" v-for="tab in tabs">
                <a class="nav-link" :class="{ active: tab.active, disabled: tab.disabled }" href="#{{ $index }}" role="tab" data-toggle="tab" @click.stop.prevent="activateTab($index)">{{{ tab.header }}}</a>
            </li>
        </ul>

        <!-- Tab panes -->
        <div class="tab-content">
            <slot></slot>
        </div>

        <!-- Nav tabs -->
        <ul v-if="orientation == 'bottom' || orientation == 'right'" class="nav nav-tabs" role="tablist">
            <li class="nav-item" v-for="tab in tabs">
                <a class="nav-link" :class="{ active: tab.active, disabled: tab.disabled }" href="#{{ $index }}" role="tab" data-toggle="tab" @click.stop.prevent="activateTab($index)">{{{ tab.header }}}</a>
            </li>
        </ul>
    </div>
</template>

<style lang="sass" src="./tabs.scss"></style>

<script type="text/babel">
    export default {
        props: {
            orientation: {
                type: String,
                default: 'top'
            }
        },
        data: function()
        {
            return {
                tabs: []
            };
        },
        methods: {
            orientationClass: function()
            {
                return 'tabs-' + this.orientation;
            },
            activateTab: function(index)
            {
                var tab = this.tabs[index];

                if(tab && !tab.disabled)
                {
                    if(index == 'first')
                    {
                        index = 0;
                    }
                    else if(index == 'last')
                    {
                        index = this.tabs.length - 1;
                    } // end if

                    this.tabs.forEach(function(tab, idx)
                    {
                        tab.active = idx === index;
                    });
                } // end if
            },
            ensureActiveTab: function()
            {
                var activeTab = 0;
                this.tabs.forEach((tab, index) =>
                {
                    if(tab.active)
                    {
                        activeTab = index;
                    } // end if
                });

                this.activateTab(activeTab);
            },
            registerTab: function(tab)
            {
                tab.id = this.tabs.length;
                this.tabs.push(tab);
                this.ensureActiveTab();
            },
            removeTab(tab)
            {
                this.tabs.$remove(tab);
                this.ensureActiveTab();
            }
        }
    }
</script>