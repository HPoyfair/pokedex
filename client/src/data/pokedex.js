const pokedex = Array.from({ length: 1010 }, (_, i) => ({
    dexNumber: i + 1,
    name: `Pokemon #${i + 1}`,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png`
  }));
  
  export default pokedex;
  