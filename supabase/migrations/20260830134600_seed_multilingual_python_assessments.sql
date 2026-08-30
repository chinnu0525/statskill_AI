do $$
declare
  v_competency uuid;
  v_assessment uuid;
  v_question uuid;
begin
  select id into v_competency from public.competencies where code = 'TECH-PYTHON';
  if v_competency is null then raise exception 'TECH-PYTHON competency is required'; end if;

  if not exists (select 1 from public.assessments where title = 'Python Foundations Check' and locale = 'en') then
    insert into public.assessments (title, competency_id, locale) values ('Python Foundations Check', v_competency, 'en') returning id into v_assessment;
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'Which Python data type is commonly used to store an ordered mutable collection?', '[{"id":"A","label":"List"},{"id":"B","label":"Tuple"},{"id":"C","label":"Set"},{"id":"D","label":"Integer"}]'::jsonb, 'Lists are ordered and mutable.') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'A');
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'What does len(data) return when data is a Python list?', '[{"id":"A","label":"The sum of values"},{"id":"B","label":"The number of items"},{"id":"C","label":"The final item"},{"id":"D","label":"The data type"}]'::jsonb, 'len() returns the number of items in a collection.') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'B');
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'Which keyword begins a function definition in Python?', '[{"id":"A","label":"func"},{"id":"B","label":"function"},{"id":"C","label":"def"},{"id":"D","label":"define"}]'::jsonb, 'Python functions are declared with the def keyword.') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'C');
  end if;

  if not exists (select 1 from public.assessments where title = 'Python आधारभूत जाँच' and locale = 'hi') then
    insert into public.assessments (title, competency_id, locale) values ('Python आधारभूत जाँच', v_competency, 'hi') returning id into v_assessment;
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'Python में क्रमबद्ध और परिवर्तनीय संग्रह रखने के लिए सामान्यतः किस डेटा प्रकार का उपयोग किया जाता है?', '[{"id":"A","label":"List"},{"id":"B","label":"Tuple"},{"id":"C","label":"Set"},{"id":"D","label":"Integer"}]'::jsonb, 'List क्रमबद्ध और परिवर्तनीय होती है।') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'A');
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'यदि data एक Python list है, तो len(data) क्या लौटाता है?', '[{"id":"A","label":"मानों का योग"},{"id":"B","label":"आइटमों की संख्या"},{"id":"C","label":"अंतिम आइटम"},{"id":"D","label":"डेटा प्रकार"}]'::jsonb, 'len() संग्रह में आइटमों की संख्या लौटाता है।') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'B');
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'Python में function definition किस keyword से शुरू होती है?', '[{"id":"A","label":"func"},{"id":"B","label":"function"},{"id":"C","label":"def"},{"id":"D","label":"define"}]'::jsonb, 'Python में function को def keyword से घोषित किया जाता है।') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'C');
  end if;

  if not exists (select 1 from public.assessments where title = 'Python ప్రాథమిక తనిఖీ' and locale = 'te') then
    insert into public.assessments (title, competency_id, locale) values ('Python ప్రాథమిక తనిఖీ', v_competency, 'te') returning id into v_assessment;
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'Python లో క్రమబద్ధమైన మరియు మార్చగల collection ను నిల్వ చేయడానికి సాధారణంగా ఏ data type ఉపయోగిస్తారు?', '[{"id":"A","label":"List"},{"id":"B","label":"Tuple"},{"id":"C","label":"Set"},{"id":"D","label":"Integer"}]'::jsonb, 'List క్రమబద్ధమైనది మరియు మార్చగలది.') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'A');
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'data ఒక Python list అయితే len(data) ఏమి ఇస్తుంది?', '[{"id":"A","label":"విలువల మొత్తం"},{"id":"B","label":"అంశాల సంఖ్య"},{"id":"C","label":"చివరి అంశం"},{"id":"D","label":"డేటా రకం"}]'::jsonb, 'len() collection లోని అంశాల సంఖ్యను ఇస్తుంది.') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'B');
    insert into public.questions (assessment_id, question_text, options, explanation) values (v_assessment, 'Python లో function definition ఏ keyword తో ప్రారంభమవుతుంది?', '[{"id":"A","label":"func"},{"id":"B","label":"function"},{"id":"C","label":"def"},{"id":"D","label":"define"}]'::jsonb, 'Python లో function ను def keyword తో ప్రకటిస్తారు.') returning id into v_question;
    insert into public.question_answers(question_id, correct_answer) values (v_question, 'C');
  end if;
end $$;
