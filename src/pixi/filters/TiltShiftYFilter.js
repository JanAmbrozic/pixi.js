PIXI.TiltShiftYFilter = function()
{
    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        blur: {type: '1f', value: 100.0},
        gradientBlur: {type: '1f', value: 600.0},
        start: {type: '2f', value:{x:0, y:window.screenHeight / 2}},
        end: {type: '2f', value:{x:600, y:window.screenHeight / 2}},
        delta: {type: '2f', value:{x:30, y:30}},
        texSize: {type: '2f', value:{x:window.screenWidth, y:window.screenHeight}}
    };
    
    this.updateDelta();

    this.fragmentSrc = [
        'precision mediump float;',
        'uniform sampler2D uSampler;',
        'uniform float blur;',
        'uniform float gradientBlur;',
        'uniform vec2 start;',
        'uniform vec2 end;',
        'uniform vec2 delta;',
        'uniform vec2 texSize;',
        'varying vec2 vTextureCoord;',

        'float random(vec3 scale, float seed) {',
        '   return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);',
        '}',

        'void main(void) {',
        '    vec4 color = vec4(0.0);',
        '    float total = 0.0;',
        
        '    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);',
        '    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));',
        '    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;',
        
        '    for (float t = -30.0; t <= 30.0; t++) {',
        '        float percent = (t + offset - 0.5) / 30.0;',
        '        float weight = 1.0 - abs(percent);',
        '        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);',
        '        sample.rgb *= sample.a;',
        '        color += sample * weight;',
        '        total += weight;',
        '    }',

        '    gl_FragColor = color / total;',
        '    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;',
        '}'
    ];
};

PIXI.TiltShiftYFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.TiltShiftYFilter.prototype.constructor = PIXI.TiltShiftYFilter;

Object.defineProperty(PIXI.TiltShiftYFilter.prototype, 'blur', {
    get: function() {
        return this.uniforms.blur.value;
    },
    set: function(value) {
        this.dirty = true;
        this.uniforms.blur.value = value;
    }
});

Object.defineProperty(PIXI.TiltShiftYFilter.prototype, 'gradientBlur', {
    get: function() {
        return this.uniforms.gradientBlur.value;
    },
    set: function(value) {
        this.dirty = true;
        this.uniforms.gradientBlur.value = value;
    }
});

Object.defineProperty(PIXI.TiltShiftYFilter.prototype, 'start', {
    get: function() {
        return this.uniforms.start.value;
    },
    set: function(value) {
        this.dirty = true;
        this.uniforms.start.value = value;
        this.updateDelta();
    }
});

Object.defineProperty(PIXI.TiltShiftYFilter.prototype, 'end', {
    get: function() {
        return this.uniforms.end.value;
    },
    set: function(value) {
        this.dirty = true;
        this.uniforms.end.value = value;
        this.updateDelta();
    }
});

PIXI.TiltShiftYFilter.prototype.updateDelta = function(){
    var dx = this.uniforms.end.value.x - this.uniforms.start.value.x;
    var dy = this.uniforms.end.value.y - this.uniforms.start.value.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    this.uniforms.delta.value.x = -dy / d;
    this.uniforms.delta.value.y = dx / d;
};