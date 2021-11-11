SELECT NAME
FROM USER
WHERE CALL_NO = #mobile#;
SELECT LOAN_PRINCIPAL,
    LOAN_DATE,
    STATEMENT
FROM LOAN
WHERE CALL_NO = #mobile#
ORDER BY LOAN_DATE;
SELECT *
FROM (
        SELECT LOAN_PRINCIPAL,
            LOAN_DATE,
            STATEMENT
        FROM LOAN
        WHERE CALL_NO = #mobile#
    ) A
WHERE A.LOAN_DATE BETWEEN #startDate# AND #lastDate#;
INSERT INTO MANSPAWNSHOP.LIMIT_SEARCH_POST(
        'POST_NO',
        'TITLE',
        'WRITE_DATE',
        'CONTENT',
        'CALL_NO'
    )
VALUES(
        #postNo#,
        #postTitle#,
        #writeDate#,
        #content#,
        #userCallNo#
    );
INSERT INTO MANSPAWNSHOP.USER('NAME', 'CALL_NO')
VALUES(
        #userName#,
        #mobile#
    );