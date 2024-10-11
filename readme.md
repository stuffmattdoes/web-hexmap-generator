# 3D Hexagonal Map Generator
![Randomly-generated hexagonal grid](./screenshots/main.png)

A web-based tool that randomly generates terrain organized into a hexagonal grid.
Serves as a foray into web shaders:
* Distance fog
* 3D Terrain texturing
* Water visuals

**Built with Three.js**

## Requirements
To run this project, install the following software on your machine:
- [Node.js](https://nodejs.org/en/)

## Notable Tools
- [Parcel.js](https://parceljs.org/) - Javscript bundler & local dev server
- [Three.js](https://threejs.org/) - web-based 3D javascript engine

## Setup
1. `npm install`
2. `npm run dev`
3. Visit `localhost:1234` in your browser

## How-To
To generate the hex map, we're going to do the following:

1. First, we'll draw up a hexagon matrix. I've added [x,y] coordinates to each hexagon so you can see the order they're drawn in. The colors are random and simply to differentiate each hexagon.
<img width="974" alt="step-1" src="https://raw.githubusercontent.com/stuffmattdoes/web-hexmap-generator/3f3aeeda3467a54b22f9618449b10ded539b3e73/cover-image.png">

2. Next, let's add a random height value to each hexagon. Additionally, instead of a random color, let's also give it a color according to its height:
- baseline = blue water
- low = yellow sand
- medium = green grass
- tall = brown rock
- tallest = white snow

These colors crudely represent a mountainscape and some bodies of water. We can think of each color as a "biome" in the real world.
<img width="974" alt="step-2" src="https://github.com/stuffmattdoes/web-hexmap-generator/blob/master/screenshots/cover-image-01.png">

3. So far, our map isn't very friendly - each hexagon is a random value without concern for its neighboring values. This leads to a turbulent landscape instead of smooth transitions between "biomes." To accomplish this smooth transition, we'll use a noise pattern instead of randomized values for each space.

Applying "noise" to modifiy 3D objects is a common practice to add interest to an otherwise smooth surface. In our case, we're going to use a noise function that generates a texture like this

![image](https://github.com/user-attachments/assets/c225ff76-5efb-4a07-8d4f-b55ad886722d)

4. Now we'll reference this texture to determine the height of each hexagon. Small numeric values from the noise function result in the dark areas of the texture, and will translate to low watery hexagons on our map - water! Conversely, large numeric values from the noise function result in light areas on the previous texture, and will show up as tall snowy hexagons on our map. And since this noise function smoothly transitions between values, our landscape looks more realistic.
<img width="974" alt="step-3" src="https://github.com/stuffmattdoes/web-hexmap-generator/blob/master/screenshots/cover-image-02.png">

Here's removing wireframes & adding in "fog" for a more scenic shot
<img width="974" alt="step-4" src="https://github.com/stuffmattdoes/web-hexmap-generator/blob/master/screenshots/cover-image-03.png">

5. Next up is the water. So far, we've modeled blue hexagons at random depths, which simulate the varying height of a sea floor. But we also want the actual level surface of the water. To accomplish this, we'll simply draw a big plane at the top of the blue hexagons.

<img width="974" alt="step-5" src="https://github.com/stuffmattdoes/web-hexmap-generator/blob/master/screenshots/cover-image-04.png">

6. BONUS - water effects. The water effects here get pretty complex, so I'll likely leave that explanation for later. But here's a few characteristics of the water:
- Stylized & animated waves, which take on a cartoonish look
- Depth-based light attenuation - notice how the visibility of the hexagons diminishes as the water gets deeper
- Shoreline foam effect - as water approaches the sandy hexagons, we see some white foam and more turbulence
<img width="974" alt="step-5" src="https://github.com/stuffmattdoes/web-hexmap-generator/blob/master/screenshots/cover-image-05.png">
