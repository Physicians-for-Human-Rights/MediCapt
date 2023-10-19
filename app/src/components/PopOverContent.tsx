// import { RenderProp } from 'react'
import { Card, Text, Button } from '@ui-kitten/components'
import { View } from 'react-native'

interface IProps {
  content: string
  button1text: string
  button2text?: string
  headerText?: string
  subtitleText?: string
  funcButton1?: VoidFunction
  funcButton2?: VoidFunction
}
const PopoverContent = (props: IProps) => {
  const {
    content,
    button1text,
    button2text,
    headerText,
    subtitleText,
    funcButton1,
    funcButton2,
  } = props
  const Header = (props: any): React.ReactElement => (
    <View {...props}>
      <Text category="h6">{headerText}</Text>
      <Text category="s1">{subtitleText}</Text>
    </View>
  )

  const Footer = (props: any) => (
    <View
      {...props}
      // eslint-disable-next-line react/prop-types
      //   style={[props.style, styles.footerContainer]}
    >
      <Button size="small" status="basic" onPress={funcButton2 && funcButton2}>
        {button2text}
      </Button>
      <Button onPress={funcButton1 && funcButton1} size="small">
        {button1text}
      </Button>
    </View>
  )
  return (
    <Card header={Header} footer={Footer} style={{ width: 64 * 4 }}>
      <Text category="p1">{content}</Text>
    </Card>
  )
}

export default PopoverContent
