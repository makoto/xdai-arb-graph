import styled from "styled-components";

export const Container = styled.div`
  margin:1em;
`

export const Header = styled.header`
  background-color: #282c34;
  min-height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: white;
  font-size: 25px;
`;

export const Body = styled.body`
  align-items: center;
  // background-color: #282c34;
  // color: white;
  display: flex;
  flex-direction: column;
  // font-size: calc(10px + 2vmin);
  justify-content: center;
  min-height: calc(100vh - 70px);
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;
`;

export const Button = styled.button`
  background-color: green;
  border: none;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;
  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const Slider = styled.input`
  -webkit-appearance: none;
  width: 60%;
  height: 25px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    background: #4CAF50;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 25px;
    height: 25px;
    background: #4CAF50;
    cursor: pointer;
  }
`

export const SlideContainer = styled.p`
  width: 80%;
  margin-left: 5em;
  text-align: center;
`

export const Green = styled.span`
  color: green;
`

export const Red = styled.span`
  color: red;
`

export const NumberInput = styled.input`
 width: 3em;
 margin: 1em;
`
