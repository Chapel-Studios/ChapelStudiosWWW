/// <binding BeforeBuild='default' />

const sass = require('node-sass');
//require('load-grunt-tasks')(grunt);

module.exports = function (grunt) {
    //'use strict';
    //const sass = require('node_modules/node-sass');
    //require('load-grunt-tasks')(grunt);
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
                    //, {
                    //    expand: true, // Recursive
                    //    cwd: "Areas", // The startup directory
                    //    src: ["**/*.scss"], // Source files
                    //    dest: "wwwroot/css", // Destination
                    //    ext: ".css" // File extension
                    //}
                ]
            }
        }
        //, terser: {
        //    options: {
        //        output: {
        //            preamble: '// Written by Rev. J. Lee Blackwell; Please Don\'t steal my code.'
        //        }
        //    }
        //    , dist: {
        //        files: [{
        //            expand: true,
        //            cwd: "JS",
        //            src: ["**/*.js"],
        //            dest: "wwwroot/js",
        //        }]
        //    }
        //}
    });

    // Load the plugin
    grunt.loadNpmTasks('grunt-sass');
    //grunt.loadNpmTasks('grunt-terser');
    //grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['sass']);
};