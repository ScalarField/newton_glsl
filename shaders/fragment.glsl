#define PI 3.14159265359
#define MAX_ROOTS 10
#define MAX_ITER 30
#define EPSILON 0.00005

varying vec2 texcoord;

uniform float aspect;
uniform vec3[MAX_ROOTS] poly;
uniform float[MAX_ROOTS] brightness;
uniform int roots;

vec2 prod(vec2 a, vec2 b){ return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x); } 
vec2 div(vec2 a, vec2 b){ return vec2(((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y))); }

//Optimization of N-R iterations via https://www.chiark.greenend.org.uk/~sgtatham/newton/
//Smooth coloring algorithm from same source
vec2 funcquotient(vec2 p){
	
	vec2 s = vec2(0.0, 0.0);
	for(int i=0;i<roots;i++){
		vec2 root = poly[i].xy;
		float mult = poly[i].z;
		s += div(vec2(mult, 0.0), p-root);
	}
	return div(vec2(1.0, 0.0), s);
}

//Idea for second parameter from "Newton fractal" Wikipedia page
vec2 newton(vec2 p, float a){
		
	vec2 z = p;
	vec2 zp = z;
	for(int i=0;i<MAX_ITER;i++){
		zp = z;
		z -= prod(vec2(a, 0.0), funcquotient(z));
		for(int j=0;j<roots;j++){
			vec2 root = poly[j].xy;
			float d = length(z-root);
			if(d < EPSILON){
				float dp = length(zp-root);
				float t = (log(EPSILON)-log(dp))/(log(d)-log(dp));
				return vec2(float(j), float(i)+t);
			}
		}
	}
	return vec2(-1.0, 0.0);
}

//Color conversion from Sam Hocevar on StackOverflow
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 newtoncolor(vec2 n){
	if(n.x < 0.0){ return vec4(vec3(0.0), 1.0); }
	float hue = n.x/float(roots);
	float val = 1.0-smoothstep(0.0, brightness[int(n.x)], n.y/float(MAX_ITER));
	return vec4(hsv2rgb(vec3( hue, 1.0, val )), 1.0);
}

void main(){

	float xmax = 2.0;
	vec2 z = texcoord - 0.5;
	z.x *= 2.0*xmax;
	z.y *= 2.0*xmax*aspect;

	gl_FragColor = newtoncolor(newton(z, 1.5));

}
