/**
 * ScalarTree.jsx - Hierarchical Tree View for Scalar Data
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 5
 *
 * Renders nested tree structure:
 * - Learning Objectives (top level)
 *   - Topics (second level)
 *     - Subtopics (third level)
 *
 * Each node is expandable/collapsible and selectable
 */

import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import ScalarNode from './ScalarNode'

function ScalarTree({ module }) {
  const { toggleScalarExpand, addTopic, addSubtopic } = useDesign()

  if (!module.learningObjectives || module.learningObjectives.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4vh 2vw',
          color: THEME.TEXT_DIM,
          textAlign: 'center'
        }}
      >
        <p style={{ fontSize: '1.3vh', marginBottom: '1vh' }}>
          No Learning Objectives yet
        </p>
        <p style={{ fontSize: '1.1vh', fontStyle: 'italic' }}>
          Click "+ Add LO" above to create your first Learning Objective
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
      {module.learningObjectives.map((lo, loIndex) => (
        <div key={lo.id}>
          {/* Learning Objective Node */}
          <ScalarNode
            type="lo"
            data={lo}
            number={`LO ${lo.order}`}
            label={`${lo.verb} ${lo.description}`}
            expanded={lo.expanded}
            hasChildren={lo.topics && lo.topics.length > 0}
            onToggle={() => toggleScalarExpand('lo', lo.id)}
            onAdd={() => addTopic(lo.id)}
            addLabel="+ Topic"
            color={THEME.AMBER}
            depth={0}
          />

          {/* Topics (if expanded) */}
          {lo.expanded && lo.topics && lo.topics.map((topic, topicIndex) => (
            <div key={topic.id}>
              <ScalarNode
                type="topic"
                data={topic}
                number={`${lo.order}.${topic.order}`}
                label={topic.title}
                expanded={topic.expanded}
                hasChildren={topic.subtopics && topic.subtopics.length > 0}
                onToggle={() => toggleScalarExpand('topic', topic.id)}
                onAdd={() => addSubtopic(topic.id)}
                addLabel="+ Subtopic"
                color="#4a9eff"
                depth={1}
              />

              {/* Subtopics (if expanded) */}
              {topic.expanded && topic.subtopics && topic.subtopics.map((subtopic, subIndex) => (
                <ScalarNode
                  key={subtopic.id}
                  type="subtopic"
                  data={subtopic}
                  number={`${lo.order}.${topic.order}.${subtopic.order}`}
                  label={subtopic.title}
                  expanded={false}
                  hasChildren={false}
                  color="#9b59b6"
                  depth={2}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default ScalarTree
