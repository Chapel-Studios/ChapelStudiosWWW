/// <binding BeforeBuild='Debug, JustMin' ProjectOpened='Watch' />

const sass = require('node-sass');

module.exports = function (grunt) {
    // Project configuration.


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Sass
        sass: {
            options: {
                implementation: sass,
                sourceMap: true, // Create source map
                outputStyle: 'compressed' // Minify output
            },
            dist: {
                files: [
                    {
                        expand: true, // Recursive
                        cwd: "Styles", // The startup directory
                        src: ["**/*.scss", "**/*.css", "!**/_*.scss"], // Source files
                        dest: "wwwroot/css", // Destination
                        ext: ".css" // File extension
                    }
                ]
            }
        }
        , terser: {
            options: {
                output: {
                    preamble: '// Written by Rev. J. Lee Blackwell; Please Don\'t steal my code.'
                }
            },
            debug: {
                options: {
                    compress: false,
                    mangle: false,
                    output: {
                        beautify: true,
                    }
                }
                , files: [{
                    expand: true,
                    cwd: "JS",
                    src: ["**/*.js"],
                    dest: "wwwroot/js",
                }]
            }
            , release: {
                files: [{
                    expand: true,
                    cwd: "JS",
                    src: ["**/*.js"],
                    dest: "wwwroot/js",
                    ext: ".min.js"
                }]
            }
        }
        , watch: {
            files: ["JS/*.js", "Styles/*.scss"],
            tasks: "debug"
        }
    });

    // Load the plugin
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-terser');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('Debug', ['sass', 'terser:debug']);
    grunt.registerTask('JustMin', ['terser:release']);
    grunt.registerTask('Release', ['sass', 'terser:release']);
    grunt.registerTask('Watch', ['watch']);
};