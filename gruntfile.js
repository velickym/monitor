module.exports = function(grunt) {

    grunt.initConfig({

        connect : {
            default : {
                options : {
                    port : 2019,
                    livereload : 35728,
                    hostname : '*'
                }
            }
        },

        watch : {
            scripts : {
                files : ['css/*.css', '*.html']
            },
            options : {
                livereload : 35728,
                spawn : false
            }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-connect");

    // Default task(s).
    grunt.registerTask('default', ['connect', 'watch']);
};