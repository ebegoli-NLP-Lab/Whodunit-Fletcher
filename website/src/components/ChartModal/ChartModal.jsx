import React, { useState } from 'react'
import { books, barChartKeys, lineChartKeys } from './data'
import {
  List,
  Modal,
  Checkbox,
  Button,
  Card,
  Grid,
  Segment
} from 'semantic-ui-react'

const Filter = props => {
  const { disabled, isSelected, label, onFilterClicked } = props

  return (
    <List.Item key={label}>
      <Checkbox
        label={label}
        value={label}
        onClick={(e, { checked }) => onFilterClicked(label, checked)}
        checked={isSelected}
        disabled={disabled}
      />
    </List.Item>
  )
}

const QuestionList = props => {
  const { empty, title, filters, onFilterClicked } = props
  const [blockBars, setBlockBars] = useState(false)
  const [blockLines, setBlockLines] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])

  const onChartFilterClicked = (setBlock, chartKeys) => (filter, checked) => {
    let newSelectedFilters = selectedFilters.slice()
    if (checked) {
      newSelectedFilters = [...selectedFilters, filter]
      setBlock(true)
    }
    if (!checked)
      newSelectedFilters = selectedFilters.filter(
        selectedFilter => filter !== selectedFilter
      )
    if (newSelectedFilters.every(filter => !chartKeys.includes(filter)))
      setBlock(false)

    setSelectedFilters(newSelectedFilters)
    onFilterClicked(filter, checked)
  }
  const onBarFilterClicked = onChartFilterClicked(setBlockLines, barChartKeys)
  const onLineFilterClicked = onChartFilterClicked(setBlockBars, lineChartKeys)

  return (
    <Card>
      <Card.Content>
        <Card.Header>{title}</Card.Header>
      </Card.Content>
      <Card.Content>
        <List>
          {filters.length ? (
            <>
              <List.Item>
                <List.Header>Bar Chart</List.Header>
              </List.Item>
              <Filter
                label='Nearby Words'
                onFilterClicked={onBarFilterClicked}
                disabled={blockBars}
              />
              <List.Item>
                <List.Header>Line Charts</List.Header>
              </List.Item>
            </>
          ) : (
            <></>
          )}
          {filters.length ? (
            filters
              .sort()
              .filter(filter => filter !== 'Nearby Words')
              .map((filter, i) => (
                <Filter
                  key={i}
                  label={filter}
                  onFilterClicked={onLineFilterClicked}
                  disabled={blockLines}
                />
              ))
          ) : (
            <List.Description>
              Select {empty} to see available {title.toLowerCase()}
            </List.Description>
          )}
        </List>
      </Card.Content>
    </Card>
  )
}

const FilterList = props => {
  const { empty, title, filters, onFilterClicked } = props

  if (title === 'Questions') return <QuestionList {...props} />

  return (
    <Card>
      <Card.Content>
        <Card.Header>{title}</Card.Header>
      </Card.Content>
      <Card.Content>
        <List>
          {filters.length ? (
            filters
              .sort()
              .map((filter, i) => (
                <Filter
                  key={i}
                  label={filter}
                  onFilterClicked={onFilterClicked}
                />
              ))
          ) : (
            <List.Description>
              Select {empty} to see available {title.toLowerCase()}
            </List.Description>
          )}
        </List>
      </Card.Content>
    </Card>
  )
}

const removeDuplicates = arr => Array.from(new Set(arr))
const bookAuthors = removeDuplicates(books.map(book => book.author))
function ChartModal({ createChart }) {
  const defaultFilters = {
    author: [],
    question: [],
    title: []
  }
  const [open, setOpen] = React.useState(false)
  const [filters, setFilters] = React.useState(defaultFilters)

  const setFilter = filter => (label, checked) => {
    const newFilters = Object.assign({}, filters)

    if (checked) newFilters[filter].push(label)

    if (!checked)
      newFilters[filter] = newFilters[filter].filter(f => f !== label)

    setFilters(newFilters)
  }

  const bookQuestions = removeDuplicates(
    books
      .filter(book => filters.author.includes(book.author))
      .map(book => book.question)
  )
  const bookTitles = removeDuplicates(
    books
      .filter(book => filters.question.includes(book.question))
      .map(book => book.title)
  )

  const chartReady = Object.keys(filters).every(key => filters[key].length > 0)

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => {
        setOpen(true)
        setFilters(defaultFilters)
      }}
      open={open}
      trigger={
        <Segment basic textAlign='center'>
          <Button style={{ textAlign: 'center' }}>Add Chart</Button>
        </Segment>
      }
    >
      <Modal.Header>Create a Chart</Modal.Header>
      <Modal.Content>
        <Grid columns={3}>
          <Grid.Column>
            <FilterList
              filters={bookAuthors}
              title='Authors'
              onFilterClicked={setFilter('author')}
              empty='nothing'
            />
          </Grid.Column>
          <Grid.Column>
            <FilterList
              filters={bookQuestions}
              title='Questions'
              onFilterClicked={setFilter('question')}
              empty='authors'
            />
          </Grid.Column>
          <Grid.Column>
            <FilterList
              filters={bookTitles}
              title='Books'
              onFilterClicked={setFilter('title')}
              empty='questions'
            />
          </Grid.Column>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content='Create Chart'
          labelPosition='left'
          icon={chartReady ? 'checkmark' : 'x'}
          onClick={() => {
            setOpen(false)
            createChart(filters)
          }}
          positive={chartReady}
          negative={!chartReady}
          disabled={!chartReady}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default ChartModal
