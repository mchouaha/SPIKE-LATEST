import React from 'react'
import styled from 'styled-components'
import { FunctionComponent } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

interface Props {
    style?: CSSProperties
}

const MarkdownProvider: FunctionComponent<Props> = ({ style, children }) => {
    return (
        <MarkDownStyleProvider style={style}>
            {children}
        </MarkDownStyleProvider>
    )
}

const MarkDownStyleProvider = styled.div`
    margin-bottom : 1rem;

    h1,h2,h3 {
        color : ${(props) => props.theme.colors.primary};
        font-family : ${(props) => props.theme.text.secondaryFont};
        margin : 1rem 0rem;
        font-size : 1.5rem;
    }

    h1{
        font-size : 2rem;
        line-height: 1.9rem;
    }

    p{
        line-height: 1.4rem;
    }

    a{
        cursor : pointer;
        color : ${(props) => props.theme.colors.fifth};
        font-family : ${(props) => props.theme.text.secondaryFont};
    }

    img{
        margin : 0rem auto;
        width : 100%;
    }


    strong {
        font-weight : bold;
    }

    ul{
        margin : 1rem 0rem;
    }

    li{
        list-style-type : square;   
        list-style-position : outside;
        margin-left : 1.3rem;
        padding : .7rem;
    }

    ol{
        list-style-type : lower-alpha;
    }

    video{
        width : 100%;
        margin : 1rem 0rem;
    }
`

export default MarkdownProvider
