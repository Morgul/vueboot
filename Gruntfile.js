//----------------------------------------------------------------------------------------------------------------------
// Qniform Gruntfile
//----------------------------------------------------------------------------------------------------------------------

module.exports = function(grunt)
{
    grunt.initConfig({
        browserify: {
            dist: {
                options: {
                    banner: "/* VueBoot v" + require('./package').version + " */",
                    transform: [ "vueify", "babelify" ],
                    external: ['vue'],
                    plugin: [
                        [ "browserify-derequire" ]
                    ],
                    browserifyOptions: {
                        //bundleExternal: false,
                        standalone: 'vueboot'
                    }
                },
                files: {
                    "./dist/vueboot.js": "./src/vueboot.js"
                }
            }
        },
        clean: ['dist'],
        watch: {
            build: {
                files: ["src/**/*.js", "src/**/*.vue", "src/**/*.scss"],
                tasks: ["browserify"]
            }
        }
    });

    //------------------------------------------------------------------------------------------------------------------

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //------------------------------------------------------------------------------------------------------------------

    grunt.registerTask("build", ["clean", "browserify"]);
    grunt.registerTask("default", ["build", 'watch']);

    //------------------------------------------------------------------------------------------------------------------
};

//----------------------------------------------------------------------------------------------------------------------
