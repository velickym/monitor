module.exports = function(grunt) {

    grunt.initConfig({

        connect : {
            default : {
                options : {
                    port : 2022,
                    livereload : 35999,
                    hostname : '*'
                }
            }
        },

        watch : {
            scripts : {
                files : ['css/*.css', '*.html', '*.js', '*.json']
            },
            options : {
                livereload : 35999,
                spawn : false
            }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-connect");

    // Default task(s).
    grunt.registerTask('default', ['connect', 'watch']);
};

